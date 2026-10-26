param([string]$Pdf = 'assets/pdfs/pense_bem_-_disney_-_aladdin_em_os_misterios_do_oriente.pdf')
# Compatibility entry point: export the reviewed digital restoration masters.
$ErrorActionPreference = 'Stop'
& node (Join-Path $PSScriptRoot 'prepare-aladdin-artwork.mjs') --pdf $Pdf
if ($LASTEXITCODE -ne 0) { throw 'Image enhancement failed.' }
