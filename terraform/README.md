# NHN Cloud infrastructure (Pangyo / KR1)

This directory creates the infrastructure for the Kim Jae-hwan research homepage in the existing NHN Cloud company project:

- one non-U2 Compute Instance with a 30 GB persistent boot volume;
- one VPC port on a selected existing VPC (with an optional subnet selection);
- one Floating IP associated with that port;
- one dedicated security group that allows public HTTP/HTTPS and SSH only from the specified administrator CIDR.

It does **not** change Gabia DNS, deploy application secrets, copy the SQLite database, or create email records. Those remain separate, reviewable steps in [../NHN-CLOUD-MIGRATION.md](../NHN-CLOUD-MIGRATION.md).

## Prerequisites

1. Install Terraform 1.6 or later.
2. In the NHN Cloud console's existing company project, select **Pangyo (KR1)**.
3. Create or register an SSH public key under **Compute > Instance > Key Pairs**. Keep the private key outside this repository.
4. In **Compute > Instance > Management > API Endpoint Setting**, record the Tenant ID, Identity URL, and a newly generated API password. These values must never be committed.
5. From **Network > VPC**, record the UUID of an existing VPC. If the VPC exposes a subnet UUID, record it as well; otherwise the configuration can allocate the port IP automatically. The defaults select Ubuntu Server 24.04.3 LTS (2026.03.10) and `m2.c2m4` (2 vCPU / 4 GB); override them only if the company project requires a different approved image or flavor.

## Local preparation

```powershell
cd terraform
Copy-Item terraform.tfvars.example terraform.tfvars
$env:TF_VAR_nhn_user_name = "YOUR_NHN_CLOUD_ID"
$env:TF_VAR_nhn_tenant_id = "YOUR_TENANT_ID"
$env:TF_VAR_nhn_api_password = "YOUR_NEW_API_PASSWORD"
$env:TF_VAR_nhn_auth_url = "YOUR_IDENTITY_URL"
terraform init
terraform fmt -check
terraform validate
terraform plan -out homepage.tfplan
```

`terraform plan` is a read-only preview. Review its instance, boot volume, Floating IP, security group, and rules before running `terraform apply homepage.tfplan`.

For an interactive local preparation that keeps the API password out of `terraform.tfvars`, run:

```powershell
.\plan.ps1 -TerraformPath "C:\path\to\terraform.exe"
```

The script detects the current public IPv4 address and restricts SSH to it. It prompts for an SSH CIDR only if that lookup fails and produces `homepage.tfplan`.

After reviewing a plan, use `-Apply` to generate a fresh plan and apply it in the same credential-bearing PowerShell process:

```powershell
.\plan.ps1 -TerraformPath "C:\path\to\terraform.exe" -Apply
```

Saved non-secret values in the ignored `terraform.tfvars` file are reused, so only the NHN API credentials are requested again.

## After the infrastructure is created

1. Use the output `floating_ip` to SSH to the server using the configured key pair.
2. Follow the deployment sequence in [../ops/README.md](../ops/README.md): install the required Node.js version, clone the private source directory, restore the SQLite backup to `/var/lib/kimjaehwan-homepage/platform.sqlite`, create `/etc/kimjaehwan-homepage.env`, then install the systemd service and Caddyfile.
3. Use a real, monitored ACME contact email in the Caddy global options before Caddy first requests a certificate. `admin@kimjaehwan.com` is only a placeholder and is not in use.
4. Verify `http://FLOATING_IP`, the health route, and an HTTPS certificate after the DNS cutover.
5. Only then update Gabia: replace the GitHub Pages apex A records with the one `floating_ip`, make `www` point to `kimjaehwan.com`, and remove conflicting GitHub Pages records. Keep the GitHub Pages deployment until the NHN site has been verified.

## State and lifecycle

Terraform state identifies resources that incur cost and is intentionally ignored by Git. Store it in an encrypted, access-controlled location before team use; do not upload it to the public repository. The boot volume has `delete_on_termination = false` so a mistaken instance deletion does not delete the site database volume. A deliberate full teardown needs an explicit volume cleanup after a backup is verified.
