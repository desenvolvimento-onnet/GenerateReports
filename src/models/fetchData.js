const { ixcFlyLinkDb, ixcSelectDb, hubsoftMicrowebDb } = require('./database');
const axios = require('axios');

// Função para buscar dados do Hubsoft MicrowebNet
async function fetchHubsoftMicroweb() {
  const query = `
   SELECT
  cliserv.data_cadastro AS "data",
  'MicroWeb' AS sistema,
  cid.nome AS cidade,
  cli.nome_razaosocial AS cliente,
  CASE
    WHEN cli.tipo_pessoa = 'pf' THEN 'Física'
    ELSE 'Jurídica'
  END AS tipo,
  cliserv.id_cliente_servico AS contrato,
  serv.descricao AS plano,
  serv.valor AS valor,
  'Ativo' AS situacao,
  usuario.name AS consultor
FROM
  cliente_servico cliserv
  INNER JOIN cliente cli ON cli.id_cliente = cliserv.id_cliente
  INNER JOIN servico serv ON serv.id_servico = cliserv.id_servico
  INNER JOIN cliente_endereco_numero cliende ON cliende.id_cliente = cli.id_cliente
  INNER JOIN endereco_numero ende ON ende.id_endereco_numero = cliende.id_endereco_numero
  INNER JOIN cidade cid ON cid.id_cidade = ende.id_cidade
  LEFT JOIN users usuario ON usuario.id = cliserv.id_usuario_vendedor
WHERE
  cliserv.data_cadastro::DATE = CURRENT_DATE -1
  AND (LOWER(origem) LIKE '%novo%' OR origem IS NULL)

UNION ALL

SELECT
  cliserv.data_cancelamento AS "data",
  'MicroWeb' AS sistema,
  cid.nome AS cidade,
  cli.nome_razaosocial AS cliente,
  CASE
    WHEN cli.tipo_pessoa = 'pf' THEN 'Física'
    ELSE 'Jurídica'
  END AS tipo,
  cliserv.id_cliente_servico AS contrato,
  serv.descricao AS plano,
  serv.valor AS valor,
  'Cancelado' AS situacao,
  usuario.name AS consultor
FROM
  cliente_servico cliserv
  INNER JOIN cliente cli ON cli.id_cliente = cliserv.id_cliente
  INNER JOIN servico serv ON serv.id_servico = cliserv.id_servico
  INNER JOIN cliente_endereco_numero cliende ON cliende.id_cliente = cli.id_cliente
  LEFT JOIN motivo_cancelamento motivo ON motivo.id_motivo_cancelamento = cliserv.id_motivo_cancelamento
  INNER JOIN endereco_numero ende ON ende.id_endereco_numero = cliende.id_endereco_numero
  INNER JOIN cidade cid ON cid.id_cidade = ende.id_cidade
  LEFT JOIN users usuario ON usuario.id = cliserv.id_usuario_vendedor
WHERE
  cliserv.data_cancelamento::DATE = CURRENT_DATE -1
  AND UPPER(motivo.descricao) NOT LIKE '%MUDAN_A DE SERVIÇO%';
  `;

  try {
    const { rows } = await hubsoftMicrowebDb.query(query);
    return rows;
  } catch (err) {
    throw err;
  }
}

// Função para buscar dados do IXC FlyLink
async function fetchIxcFlyLink() {
  const query = `
    
SELECT
  DATE(contrato.data) AS "data",
  'FlyLink' AS sistema,
  cid.nome AS cidade,
  cli.razao AS cliente,
  CASE
    WHEN cli.tipo_pessoa = 'F' THEN 'Física'
    ELSE 'Jurídica'
  END AS tipo,
  contrato.id AS contrato,
  plano.nome AS plano,
  plano.valor_contrato AS valor,
  'Ativo' AS situacao,
  vend.nome AS consultor
FROM
  cliente_contrato contrato
  INNER JOIN cliente cli ON cli.id = contrato.id_cliente
  INNER JOIN cidade cid ON cid.id = cli.cidade
  INNER JOIN vd_contratos plano ON plano.id = contrato.id_vd_contrato
  LEFT JOIN vendedor vend ON vend.id = contrato.id_vendedor
WHERE
  contrato.data = CURRENT_DATE -1

UNION ALL


SELECT
  DATE(contrato.data_cancelamento) AS "data",
  'FlyLink' AS sistema,
  cid.nome AS cidade,
  cli.razao AS cliente,
  CASE
    WHEN cli.tipo_pessoa = 'F' THEN 'Física'
    ELSE 'Jurídica'
  END AS tipo,
  contrato.id AS contrato,
  plano.nome AS plano,
  plano.valor_contrato AS valor,
  'Cancelado' AS situacao,
  vend.nome AS consultor
FROM
  cliente_contrato contrato
  INNER JOIN cliente cli ON cli.id = contrato.id_cliente
  INNER JOIN cidade cid ON cid.id = cli.cidade
  INNER JOIN vd_contratos plano ON plano.id = contrato.id_vd_contrato
  LEFT JOIN vendedor vend ON vend.id = contrato.id_vendedor
WHERE
  contrato.data_cancelamento = CURRENT_DATE -1;

  `;

  return new Promise((resolve, reject) => {
    ixcFlyLinkDb.query(query, (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
}

// Função para buscar dados do IXC Select (usando a mesma query do FlyLink para simplificar)
async function fetchIxcSelect() {
  const query = `
   
SELECT
  DATE(contrato.data) AS "data",
  'Select' AS sistema,
  cid.nome AS cidade,
  cli.razao AS cliente,
  CASE
    WHEN cli.tipo_pessoa = 'F' THEN 'Física'
    ELSE 'Jurídica'
  END AS tipo,
  contrato.id AS contrato,
  plano.nome AS plano,
  plano.valor_contrato AS valor,
  'Ativo' AS situacao,
  vend.nome AS consultor
FROM
  cliente_contrato contrato
  INNER JOIN cliente cli ON cli.id = contrato.id_cliente
  INNER JOIN cidade cid ON cid.id = cli.cidade
  INNER JOIN vd_contratos plano ON plano.id = contrato.id_vd_contrato
  LEFT JOIN vendedor vend ON vend.id = contrato.id_vendedor
WHERE
  contrato.data = CURRENT_DATE -1

UNION ALL


SELECT
  DATE(contrato.data_cancelamento) AS "data",
  'Select' AS sistema,
  cid.nome AS cidade,
  cli.razao AS cliente,
  CASE
    WHEN cli.tipo_pessoa = 'F' THEN 'Física'
    ELSE 'Jurídica'
  END AS tipo,
  contrato.id AS contrato,
  plano.nome AS plano,
  plano.valor_contrato AS valor,
  'Cancelado' AS situacao,
  vend.nome AS consultor
FROM
  cliente_contrato contrato
  INNER JOIN cliente cli ON cli.id = contrato.id_cliente
  INNER JOIN cidade cid ON cid.id = cli.cidade
  INNER JOIN vd_contratos plano ON plano.id = contrato.id_vd_contrato
  LEFT JOIN vendedor vend ON vend.id = contrato.id_vendedor
WHERE
  contrato.data_cancelamento = CURRENT_DATE -1;
  `;

  return new Promise((resolve, reject) => {
    ixcSelectDb.query(query, (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
}


async function fetchReceitaNet() {
    try {
      const response = await axios.get(process.env.API_RECEITANET_URL);
  
      // Substituir os valores 'NaN' como string por 'null' antes de fazer o parse
      let data = response.data;
  
      // Se for uma string, substitui 'NaN' por 'null' antes de tentar parsear
      if (typeof data === 'string') {
        console.log("Resposta da API é uma string. Fazendo o parse...");
        data = data.replace(/NaN/g, 'null'); // Substitui 'NaN' por 'null'
        data = JSON.parse(data); // Agora podemos fazer o parse sem erro
      }
      // Se a resposta não for um array, gera um erro
      if (!Array.isArray(data)) {
        console.error("A resposta da API não é um array:", data);
        throw new Error("A resposta da API não está no formato esperado (array)");
      }
  
      // Agora normalizamos os dados para tratar valores ausentes ou NaN
      return data.map(item => ({
        data: item.data,
        sistema: item.sistema || 'ReceitaNet',
        cidade: item.cidade && item.cidade !== null ? item.cidade : 'UBERLÂNDIA', // Tratamento para NaN em cidade
        cliente: item.cliente,
        tipo: item.tipo,
        contrato: isNaN(item.contrato) ? null : item.contrato, // Tratamento para NaN em contrato
        plano: item.plano || null,
        situacao: item.situacao || null,
        consultor: item.consultor || null,  // Garantir consultor como null
        valor: item.valor || null          // Garantir valor como null
      }));
    } catch (err) {
      console.error("Erro ao buscar dados da API ReceitaNet:", err.message);
      throw err;
    }
}


module.exports = {
  fetchHubsoftMicroweb,
  fetchIxcFlyLink,
  fetchIxcSelect,
  fetchReceitaNet
};
