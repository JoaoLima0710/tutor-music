# Script para baixar samples do Philharmonia Orchestra
# Executa no PowerShell

$ErrorActionPreference = "Stop"

# Criar diretório de destino
$outputDir = "client/public/samples/philharmonia"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

# URLs dos samples
$samples = @(
    @{name="banjo"; url="http://www.philharmonia.co.uk/assets/audio/samples/banjo/banjo.zip"},
    @{name="bass_clarinet"; url="http://www.philharmonia.co.uk/assets/audio/samples/bass%20clarinet/bass%20clarinet.zip"},
    @{name="bassoon"; url="http://www.philharmonia.co.uk/assets/audio/samples/bassoon/bassoon.zip"},
    @{name="cello"; url="http://www.philharmonia.co.uk/assets/audio/samples/cello/cello.zip"},
    @{name="clarinet"; url="http://www.philharmonia.co.uk/assets/audio/samples/clarinet/clarinet.zip"},
    @{name="contrabassoon"; url="http://www.philharmonia.co.uk/assets/audio/samples/contrabassoon/contrabassoon.zip"},
    @{name="cor_anglais"; url="http://www.philharmonia.co.uk/assets/audio/samples/cor%20anglais/cor%20anglais.zip"},
    @{name="double_bass"; url="http://www.philharmonia.co.uk/assets/audio/samples/double%20bass/double%20bass.zip"},
    @{name="flute"; url="http://www.philharmonia.co.uk/assets/audio/samples/flute/flute.zip"},
    @{name="french_horn"; url="http://www.philharmonia.co.uk/assets/audio/samples/french%20horn/french%20horn.zip"},
    @{name="guitar"; url="http://www.philharmonia.co.uk/assets/audio/samples/guitar/guitar.zip"},
    @{name="mandolin"; url="http://www.philharmonia.co.uk/assets/audio/samples/mandolin/mandolin.zip"},
    @{name="oboe"; url="http://www.philharmonia.co.uk/assets/audio/samples/oboe/oboe.zip"},
    @{name="saxophone"; url="http://www.philharmonia.co.uk/assets/audio/samples/saxophone/saxophone.zip"},
    @{name="trombone"; url="http://www.philharmonia.co.uk/assets/audio/samples/trombone/trombone.zip"},
    @{name="trumpet"; url="http://www.philharmonia.co.uk/assets/audio/samples/trumpet/trumpet.zip"},
    @{name="tuba"; url="http://www.philharmonia.co.uk/assets/audio/samples/tuba/tuba.zip"},
    @{name="viola"; url="http://www.philharmonia.co.uk/assets/audio/samples/viola/viola.zip"},
    @{name="violin"; url="http://www.philharmonia.co.uk/assets/audio/samples/violin/violin.zip"},
    @{name="percussion"; url="http://www.philharmonia.co.uk/assets/audio/samples/percussion/percussion.zip"}
)

Write-Host "🎵 Baixando samples do Philharmonia Orchestra..." -ForegroundColor Cyan
Write-Host ""

$total = $samples.Count
$current = 0

foreach ($sample in $samples) {
    $current++
    $zipPath = Join-Path $outputDir "$($sample.name).zip"
    $extractPath = Join-Path $outputDir $sample.name
    
    Write-Host "[$current/$total] Baixando $($sample.name)..." -ForegroundColor Yellow
    
    try {
        # Baixar arquivo
        Invoke-WebRequest -Uri $sample.url -OutFile $zipPath -UseBasicParsing
        
        # Extrair ZIP
        Write-Host "  Extraindo..." -ForegroundColor Gray
        Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force
        
        # Remover ZIP após extração
        Remove-Item $zipPath -Force
        
        Write-Host "  ✅ $($sample.name) baixado e extraído" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Erro ao baixar $($sample.name): $_" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "✅ Download concluído!" -ForegroundColor Green
Write-Host "Samples disponíveis em: $outputDir" -ForegroundColor Cyan
