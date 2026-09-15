data "nhncloud_images_image_v2" "homepage" {
  name        = var.image_name
  most_recent = true
  visibility  = "public"
}

data "nhncloud_compute_flavor_v2" "homepage" {
  name = var.flavor_name
}

data "nhncloud_networking_secgroup_v2" "default" {
  name   = "default"
  region = var.region
}

resource "nhncloud_compute_keypair_v2" "homepage" {
  name       = var.key_pair_name
  public_key = file(var.ssh_public_key_path)
  region     = var.region
}

resource "nhncloud_networking_secgroup_v2" "homepage" {
  name   = "${var.instance_name}-web"
  region = var.region
}

resource "nhncloud_networking_secgroup_rule_v2" "https" {
  direction         = "ingress"
  ethertype         = "IPv4"
  protocol          = "tcp"
  port_range_min    = 443
  port_range_max    = 443
  remote_ip_prefix  = "0.0.0.0/0"
  security_group_id = nhncloud_networking_secgroup_v2.homepage.id
  description       = "Public HTTPS"
}

resource "nhncloud_networking_secgroup_rule_v2" "http" {
  direction         = "ingress"
  ethertype         = "IPv4"
  protocol          = "tcp"
  port_range_min    = 80
  port_range_max    = 80
  remote_ip_prefix  = "0.0.0.0/0"
  security_group_id = nhncloud_networking_secgroup_v2.homepage.id
  description       = "HTTP and ACME certificate validation"
}

resource "nhncloud_networking_secgroup_rule_v2" "ssh" {
  direction         = "ingress"
  ethertype         = "IPv4"
  protocol          = "tcp"
  port_range_min    = 22
  port_range_max    = 22
  remote_ip_prefix  = var.ssh_allowed_cidr
  security_group_id = nhncloud_networking_secgroup_v2.homepage.id
  description       = "Restricted SSH administration"
}

resource "nhncloud_networking_port_v2" "homepage" {
  name               = "${var.instance_name}-port"
  network_id         = var.network_id
  security_group_ids = [data.nhncloud_networking_secgroup_v2.default.id, nhncloud_networking_secgroup_v2.homepage.id]

  dynamic "fixed_ip" {
    for_each = var.subnet_id == null ? [] : [var.subnet_id]

    content {
      subnet_id = fixed_ip.value
    }
  }
}

resource "nhncloud_compute_instance_v2" "homepage" {
  name              = var.instance_name
  region            = var.region
  availability_zone = var.availability_zone
  key_pair          = nhncloud_compute_keypair_v2.homepage.name
  flavor_id         = data.nhncloud_compute_flavor_v2.homepage.id
  security_groups   = ["default", nhncloud_networking_secgroup_v2.homepage.name]

  network {
    port = nhncloud_networking_port_v2.homepage.id
  }

  block_device {
    uuid                  = data.nhncloud_images_image_v2.homepage.id
    source_type           = "image"
    destination_type      = "volume"
    boot_index            = 0
    volume_size           = var.root_volume_gb
    delete_on_termination = false
  }

  # The VPC port owns security-group attachment. Reapplying the same group to
  # both the port and the instance makes the NHN OpenStack API reject it as a
  # duplicate, so instance-level reconciliation is intentionally disabled.
  lifecycle {
    ignore_changes = [security_groups]
  }
}

resource "nhncloud_networking_floatingip_v2" "homepage" {
  pool = var.floating_ip_pool
}

resource "nhncloud_networking_floatingip_associate_v2" "homepage" {
  floating_ip = nhncloud_networking_floatingip_v2.homepage.address
  port_id     = nhncloud_networking_port_v2.homepage.id

  depends_on = [nhncloud_compute_instance_v2.homepage]
}
