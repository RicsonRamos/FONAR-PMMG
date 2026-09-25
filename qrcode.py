#!/usr/bin/env python3
"""
Gerador de QR Code para o Formulário Auxiliar Institucional FONAR (PMMG).
Destino: https://ricsonramos.github.io/FONAR-PMMG/
"""

import sys
import os

# Previne que o script 'qrcode.py' faça auto-import em vez de carregar a biblioteca instalada
_current_dir = os.path.dirname(os.path.abspath(__file__))
_saved_path = sys.path[:]
sys.path = [p for p in sys.path if p not in ('', '.', _current_dir)]

try:
    import qrcode
    from qrcode.constants import ERROR_CORRECT_H
finally:
    sys.path = _saved_path

# URL de destino da aplicação no GitHub Pages
TARGET_URL = "https://ricsonramos.github.io/FONAR-PMMG/"
DEFAULT_OUTPUT_FILE = "fonar_qrcode.png"


def generate_qr_code(url: str = TARGET_URL, output_path: str = DEFAULT_OUTPUT_FILE):
    """
    Gera uma imagem de QR Code em alta resolução com correção máxima de erros (High - 30%).
    """
    print("=" * 60)
    print("POLÍCIA MILITAR DE MINAS GERAIS — 16º BPM")
    print("Gerador Institucional de QR Code — Formulário FONAR")
    print("=" * 60)
    print(f"URL de Destino : {url}")
    print(f"Arquivo Saída  : {output_path}")

    # Configuração do QR Code com alta tolerância a erros (Nível H ~30%)
    qr = qrcode.QRCode(
        version=None,  # Ajuste automático do tamanho
        error_correction=ERROR_CORRECT_H,
        box_size=12,   # 12 pixels por módulo para alta definição
        border=4       # Margem de segurança padrão recomendada
    )

    qr.add_data(url)
    qr.make(fit=True)

    # Renderiza a imagem
    img = qr.make_image(fill_color="#1F2421", back_color="#FFFFFF")
    img.save(output_path)

    full_path = os.path.abspath(output_path)
    print(f"✓ QR Code gerado com sucesso!")
    print(f"✓ Dimensões    : {img.size[0]}x{img.size[1]} pixels")
    print(f"✓ Localização  : {full_path}")
    print("=" * 60)

    # Exibe versão legível no terminal para leitura imediata
    print("\nVisualização no terminal (escaneie com a câmera do celular):")
    try:
        qr.print_ascii(invert=True)
    except Exception:
        pass

    return full_path


if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_OUTPUT_FILE
    generate_qr_code(output_path=out_file)
