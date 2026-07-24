# Controle de Materiais Orçados × Materiais Baixados — SAP

Aplicação web estática para acompanhamento executivo de materiais de projetos de engenharia. O dashboard compara quantidades orçadas e baixadas, consolida projetos, identifica inconsistências, cria rankings e permite atualizar a análise com novas extrações SAP diretamente no navegador.

## Visão geral

A carga inicial foi gerada a partir da aba `Materiais` do arquivo `10_projetos_Metro_15_IA_Copilot.xlsx`:

- 3.047 registros;
- 10 projetos;
- 400 materiais distintos;
- 21.804,892 unidades orçadas;
- 10.942,374 unidades baixadas;
- 50,183% de realização geral.

Os dados iniciais são carregados de `data/base-inicial.json`. O arquivo `data/base-embed.js` funciona como contingência para que o painel também possa abrir diretamente pelo `index.html`, sem servidor local.

## Funcionalidades

- KPIs de registros, projetos, contratos, materiais, orçamento, baixa, saldo e inconsistências;
- filtros combináveis e busca global com atualização automática;
- dez análises gráficas por projeto, status, material, movimento, contrato e período;
- ranking dos 15 projetos com menor realização;
- gráfico empilhado em 100% para baixado × não baixado;
- tabela consolidada por projeto com ordenação e paginação real;
- detalhamento de materiais em modal;
- importação de `.xlsx`, `.xls`, `.xlsm`, `.csv` e `.json`;
- seleção e consolidação de múltiplas abas;
- mapeamento automático e manual de colunas por aliases;
- exportação de CSV, JSON, inconsistências, projetos, materiais, relatório para impressão e gráficos PNG;
- classificação configurável dos status;
- tema claro/escuro, menu responsivo, relógio local e acessibilidade por teclado;
- processamento local, sem backend e sem envio das bases SAP.

## Estrutura

```text
controle-materiais-sap/
├── index.html
├── README.md
├── .nojekyll
├── assets/
│   ├── app.js
│   ├── styles.css
│   ├── logo-enel.svg
│   ├── favicon.svg
│   ├── background-pattern.svg
│   └── vendor/
├── data/
│   ├── base-inicial.json
│   ├── base-embed.js
│   ├── dicionario-campos.csv
│   └── resumo-validacao.json
├── docs/
│   └── manual-utilizacao.md
└── tools/
    ├── extract_base.py
    └── build_model.mjs
```

## Como executar

### Opção rápida

Abra `index.html` em um navegador moderno. A contingência incorporada carregará os dados iniciais.

### Servidor local

Na pasta do projeto, execute:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Como importar uma nova base SAP

1. Clique em **Importar Nova Base SAP**.
2. Selecione um arquivo Excel, CSV ou JSON.
3. Marque uma ou mais abas.
4. Revise o mapeamento dos campos detectados.
5. Clique em **Consolidar e atualizar**.

Todas as linhas das abas selecionadas são processadas. Os rankings têm limite apenas visual; os KPIs, validações, filtros, consolidações e exportações consideram a seleção completa.

## Campos esperados

Os campos mínimos recomendados são:

- Projeto;
- Código do Material;
- Quantidade Orçada;
- Quantidade Baixada.

Também são reconhecidos contrato, descrição do projeto, descrição do material, unidade, reserva, movimento, data, centro, depósito, documento SAP e item SAP. Consulte `data/dicionario-campos.csv` para os aliases.

## Atualizar a base inicial

Execute o extrator informando o novo arquivo:

```bash
python tools/extract_base.py caminho/para/nova_base.xlsx
```

O arquivo precisa ter uma aba chamada `Materiais` com os cabeçalhos mapeados pelo script. O processo atualiza `base-inicial.json`, a contingência `base-embed.js` e o resumo de validação.

## Publicação no GitHub Pages

1. Envie todos os arquivos para a branch `main`.
2. Abra **Settings → Pages** no repositório.
3. Em **Build and deployment**, selecione **Deploy from a branch**.
4. Escolha a branch `main` e a pasta `/ (root)`.
5. Salve e aguarde a publicação.

O arquivo `.nojekyll` já está incluído.

## Tecnologias

- HTML5 semântico;
- CSS responsivo com identidade visual corporativa;
- Tailwind CSS via CDN;
- JavaScript Vanilla ES6+;
- Chart.js;
- SheetJS;
- Lucide Icons;
- FileReader, Blob, `localStorage` e APIs nativas do navegador.

## Privacidade

Arquivos importados são lidos e processados localmente. O dashboard não possui backend, banco de dados, autenticação, telemetria ou rotina de envio das informações SAP.

## Limitações práticas

Não existe corte arbitrário de projetos ou linhas na lógica. O volume máximo é determinado pela memória e pelo desempenho do navegador e do equipamento. Bases muito grandes não são gravadas no `localStorage`; somente metadados e preferências leves são persistidos.

## Logomarca

`assets/logo-enel.svg` é um espaço reservado claramente identificado. Substitua-o somente pelo arquivo oficial autorizado, mantendo o mesmo nome e respeitando proporção e área de respiro da marca.

O botão **Baixar modelo de planilha** gera o arquivo Excel diretamente no navegador, sem depender de um arquivo binário hospedado.
