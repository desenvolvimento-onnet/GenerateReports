import win32com.client as win32
import sys
import os
from datetime import datetime

def ensure_directory_exists(path):
    """Garante que o diretório existe, criando-o se necessário."""
    if not os.path.exists(path):
        os.makedirs(path)

def convert_excel_to_pdf(input_path):
    try:
        # Inicializa o Excel
        excel = win32.Dispatch("Excel.Application")
        excel.Visible = False

        # Abre o arquivo Excel
        workbook = excel.Workbooks.Open(input_path)

        # Obtém a data atual para criar a estrutura de pastas
        current_date = datetime.now()
        year = current_date.strftime("%Y")
        month = current_date.strftime("%m")
        day = current_date.strftime("%d")
        formatted_date = current_date.strftime("%d-%m-%Y")  # Formato dd-mm-aaaa

        # Define a estrutura de pastas
        base_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "reports")
        year_dir = os.path.join(base_dir, year)
        month_dir = os.path.join(year_dir, month)
        day_dir = os.path.join(month_dir, day)

        # Cria as pastas se não existirem
        ensure_directory_exists(day_dir)

        # Define o caminho do arquivo PDF com o nome baseado na data
        output_path = os.path.join(day_dir, f"{formatted_date}.pdf")

        # Exporta como PDF
        workbook.ExportAsFixedFormat(0, output_path)

        # Fecha o Excel
        workbook.Close(False)
        excel.Quit()

        print(f"PDF gerado com sucesso: {output_path}")
        return output_path
    except Exception as e:
        print(f"Erro ao converter Excel para PDF: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python convert_excel_to_pdf.py <caminho_arquivo_excel>")
        sys.exit(1)

    excel_path = sys.argv[1]
    if not os.path.isfile(excel_path):
        print("Arquivo Excel não encontrado!")
        sys.exit(1)

    convert_excel_to_pdf(excel_path)
