output "floating_ip" {
  description = "Public IPv4 address to verify before changing the Gabia A record."
  value       = nhncloud_networking_floatingip_v2.homepage.address
}

output "instance_id" {
  description = "NHN Cloud instance UUID."
  value       = nhncloud_compute_instance_v2.homepage.id
}

output "fixed_ip" {
  description = "Private IPv4 address on the selected VPC subnet."
  value       = nhncloud_compute_instance_v2.homepage.network[0].fixed_ip_v4
}
