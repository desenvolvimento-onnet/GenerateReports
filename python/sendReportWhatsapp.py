from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import os
import time
from datetime import datetime

def get_report_path():
    # Cria o caminho da pasta com base na data atual
    base_path = os.path.join(os.path.dirname(os.getcwd()), "reports")
    current_date = datetime.now()
    year_folder = os.path.join(base_path, str(current_date.year))
    month_folder = os.path.join(year_folder, f"{current_date.month:02}")
    day_folder = os.path.join(month_folder, f"{current_date.day:02}")
    
    if not os.path.exists(day_folder):
        raise FileNotFoundError(f"Pasta com a data atual não encontrada: {day_folder}")

    # Define o nome do arquivo PDF
    pdf_filename = current_date.strftime("%d-%m-%Y") + ".pdf"
    pdf_path = os.path.join(day_folder, pdf_filename)

    if not os.path.isfile(pdf_path):
        raise FileNotFoundError(f"Relatório PDF não encontrado: {pdf_path}")
    
    return pdf_path

def send_whatsapp_document(contact_name, document_path):
    # Caminho para o perfil do Chrome (crie este diretório dentro do seu projeto)
    user_data_dir = os.path.join(os.getcwd(), "chromedata")  # Pasta local para o perfil

    # Cria o diretório caso ele não exista
    if not os.path.exists(user_data_dir):
        os.makedirs(user_data_dir)

    # Configura o Chrome para usar o perfil de dados local
    options = Options()
    options.add_argument(f"user-data-dir={user_data_dir}")  # Especifica o diretório do perfil
    options.add_argument("profile-directory=Default")  # O perfil 'Default' ou o seu perfil customizado
    options.add_argument("--no-sandbox")  # Desabilita o sandbox (caso necessário)
    options.add_argument("--disable-dev-shm-usage")  # Desabilita o uso de memória compartilhada, útil em alguns sistemas

    # Inicia o navegador com as opções configuradas
    driver = webdriver.Chrome(options=options)
    driver.maximize_window()

    try:
        # Acessa o WhatsApp Web
        driver.get("https://web.whatsapp.com/")
        print("Verificando se a sessão está salva...")

        # Espera até que o campo de pesquisa esteja disponível
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.XPATH, '//div[@contenteditable="true"][@data-tab="3"]'))
        )

        # Busca o contato no WhatsApp
        search_box = driver.find_element(By.XPATH, '//div[@contenteditable="true"][@data-tab="3"]')
        search_box.click()
        search_box.send_keys(contact_name)
        search_box.send_keys(Keys.ENTER)

        # Espera até o campo de mensagem estar disponível
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.XPATH, '//div[@contenteditable="true"][@data-tab="10"]'))
        )

        # Encontra o campo de mensagem
        message_box = driver.find_element(By.XPATH, '//div[@contenteditable="true"][@data-tab="10"]')
        message_box.click()
        message_box.send_keys("Bom dia. Segue Relatório - Análise de Eficiência comercial em Araguari e Uberlândia")
        message_box.send_keys(Keys.ENTER)

        # Espera até que o botão "+" de anexar esteja disponível
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.XPATH, '//span[@data-icon="plus"]'))
        )

        # Clica no botão "+" para abrir as opções de anexo
        plus_button = driver.find_element(By.XPATH, '//span[@data-icon="plus"]')
        plus_button.click()

        # Espera até que o botão "Documento" apareça e clique nele
        document_button = WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.XPATH, '//input[@accept="*"]'))
        )
        document_button.send_keys(document_path)

        # Aguarda o upload do arquivo
        time.sleep(3)

        # Clica no botão de envio
        send_button = driver.find_element(By.XPATH, '//span[@data-icon="send"]')
        send_button.click()

        print("Relatório enviado com sucesso!")
        time.sleep(5)  # Aguarde o envio antes de fechar
    finally:
        driver.quit()

if __name__ == "__main__":
    try:
        # Obtém o caminho do relatório PDF
        pdf_path = get_report_path()
        print(f"Relatório encontrado: {pdf_path}")

        # Envia o relatório para o WhatsApp
        contact = "Welington Pepsi"  # Substitua pelo nome do contato no WhatsApp
        send_whatsapp_document(contact, pdf_path)
    except Exception as e:
        print(f"Erro: {e}")
