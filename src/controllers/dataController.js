const XlsxPopulate = require('xlsx-populate');
const path = require('path');
const { execFile } = require("child_process");

const {
    fetchIxcFlyLink,
    fetchIxcSelect,
    fetchHubsoftMicroweb,
    fetchReceitaNet
} = require('../models/fetchData');



exports.getAllData = async (req, res) => {
    try {
        const [ixcFlyLinkData, ixcSelectData, hubsoftMicrowebData, receitaNetData] = await Promise.all([
            fetchIxcFlyLink(),
            fetchIxcSelect(),
            fetchHubsoftMicroweb(),
            fetchReceitaNet()
        ]);

        const allData = [
            ...ixcFlyLinkData,
            ...ixcSelectData,
            ...hubsoftMicrowebData,
            ...receitaNetData
        ];

        res.json(allData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching data', error: error.message });
    }
};


exports.generateReports = async (req, res) => {
    try {
        // Obter os dados
        const [ixcFlyLinkData, ixcSelectData, hubsoftMicrowebData, receitaNetData] = await Promise.all([
            fetchIxcFlyLink(),
            fetchIxcSelect(),
            fetchHubsoftMicroweb(),
            fetchReceitaNet()
        ]);

        const allData = [...ixcFlyLinkData, ...ixcSelectData, ...hubsoftMicrowebData, ...receitaNetData];

        console.log(allData)
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() -1); // Subtrai um dia
        
        const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`;
        
        // Processar os dados para agrupamento por sistema
        const groupedBySystem = allData.reduce((acc, item) => {
            const { sistema, situacao } = item;
            if (!acc[sistema]) acc[sistema] = { Ativo: 0, Cancelado: 0 }; // Inicializar contadores
            if (situacao === 'Ativo') acc[sistema].Ativo += 1;
            if (situacao === 'Cancelado') acc[sistema].Cancelado += 1;
            return acc;
        }, {});

        const systemData = Object.keys(groupedBySystem).map(system => ({
            sistema: system,
            vendas: groupedBySystem[system].Ativo,
            cancelamentos: groupedBySystem[system].Cancelado
        }));

        console.log(systemData);

        // Agrupamento por cidade
        const targetCities = ['Araguari','Uberlândia','Monte Alegre', 'Tupaciguara', 'Prata', 'Outras'];

        const normalizeCity = city => {
            if (!city) return 'Outras';
            
            const normalized = city.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        
            // Condição para tratar "Monte Alegre de Minas" como "Monte Alegre"
            if (normalized.includes("monte alegre de minas")) {
                return "monte alegre"; // Normalizado
            }
            return normalized;
        };


        const groupedByCity = targetCities.reduce((acc, city) => {
            acc[city] = { Ativo: 0, Cancelado: 0 };
            return acc;
        }, {});

        allData.forEach(item => {
            const { cidade, situacao } = item;

            // Substituir "Monte Alegre de Minas" por "Monte Alegre"
            const normalizedCity = targetCities.find(target => 
                normalizeCity(target) === normalizeCity(cidade)
            ) || 'Outras';

            if (situacao === 'Ativo') groupedByCity[normalizedCity].Ativo += 1;
            if (situacao === 'Cancelado') groupedByCity[normalizedCity].Cancelado += 1;
        });

        const cityData = targetCities.map(city => ({
            cidade: city,
            vendas: groupedByCity[city].Ativo,
            cancelamentos: groupedByCity[city].Cancelado
        }));

        console.log(cityData);

        // Acessar diretamente as propriedades do array
        const [city1, city2, city3, city4, city5, city6] = cityData;

        // Caminho para o modelo de planilha
        const templatePath = path.join(__dirname, 'relatorio-modelo.xlsx');
        const outputPath = path.join(__dirname, 'relatorio-final.xlsx');

        // Carregar o modelo de planilha
        const workbook = await XlsxPopulate.fromFileAsync(templatePath);

        // Acessar a planilha (no exemplo, "comercial")
        const sheet = workbook.sheet('comercial');

        // Atualizar os dados diretamente nas células (sistemas)
        const [system1, system2, system3, system4] = systemData;

        sheet.cell('B38').value(system1?.sistema || 0);
        sheet.cell('B39').value(system2?.sistema || 0);
        sheet.cell('B40').value(system3?.sistema || 0);
        sheet.cell('B41').value(system4?.sistema || 0);

        sheet.cell('C38').value(system1?.vendas || 0);
        sheet.cell('C39').value(system2?.vendas || 0);
        sheet.cell('C40').value(system3?.vendas || 0);
        sheet.cell('C41').value(system4?.vendas || 0);

        sheet.cell('G38').value(system1?.sistema || 0);
        sheet.cell('G39').value(system2?.sistema || 0);
        sheet.cell('G40').value(system3?.sistema || 0);
        sheet.cell('G41').value(system4?.sistema || 0);

        sheet.cell('H38').value(system1?.cancelamentos || 0);
        sheet.cell('H39').value(system2?.cancelamentos || 0);
        sheet.cell('H40').value(system3?.cancelamentos || 0);
        sheet.cell('H41').value(system4?.cancelamentos || 0);

        // Atualizar os dados diretamente nas células (cidades)
        sheet.cell('A65').value(city1?.cidade || 0);
        sheet.cell('A66').value(city2?.cidade || 0);
        sheet.cell('A67').value(city3?.cidade || 0);
        sheet.cell('A68').value(city4?.cidade || 0);
        sheet.cell('A69').value(city5?.cidade || 0);
        sheet.cell('A70').value(city6?.cidade || 0);

        sheet.cell('B65').value(city1?.vendas || 0);
        sheet.cell('B66').value(city2?.vendas || 0);
        sheet.cell('B67').value(city3?.vendas || 0);
        sheet.cell('B68').value(city4?.vendas || 0); 
        sheet.cell('B69').value(city5?.vendas || 0); 
        sheet.cell('B70').value(city6?.vendas || 0); 

        sheet.cell('C65').value(city1?.cancelamentos || 0);
        sheet.cell('C66').value(city2?.cancelamentos || 0);
        sheet.cell('C67').value(city3?.cancelamentos || 0);
        sheet.cell('C68').value(city4?.cancelamentos || 0);
        sheet.cell('C69').value(city5?.cancelamentos || 0);
        sheet.cell('C70').value(city6?.cancelamentos || 0);

        // datas
        sheet.cell('H33').value(formattedDate);
        sheet.cell('C36').value(formattedDate);
        sheet.cell('H36').value(formattedDate);
        sheet.cell('H61').value(formattedDate);
        sheet.cell('B63').value(formattedDate);
        sheet.cell('H90').value(formattedDate);

        // Salvar a planilha atualizada
        await workbook.toFileAsync(outputPath);

        // Caminho do script Python
        const pythonScript = path.resolve(__dirname, "..", "..", "python", "convertExcelToPdf.py");

        // Chamar o script Python para converter o Excel em PDF
        execFile("python", [pythonScript, outputPath], (error, stdout, stderr) => {
            if (error) {
                console.error("Erro ao executar o script Python:", error);
                return res.status(500).json({ message: "Erro ao converter Excel para PDF", error });
            }

            if (stderr) {
                console.error("Erro no script Python:", stderr);
                return res.status(500).json({ message: "Erro no script Python", stderr });
            }

            console.log(stdout);
            const outputPDF = outputPath.replace(".xlsx", ".pdf");

            // Retornar o caminho dos arquivos gerados (Excel e PDF)
            res.status(200).json({
                message: "Relatório gerado com sucesso!",
                excelFilePath: outputPath,
                pdfFilePath: outputPDF
            });
        });
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        res.status(500).json({ message: 'Erro ao gerar relatório', error: error.message });
    }
};