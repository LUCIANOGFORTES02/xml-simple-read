const fs = require('fs');
const xml2js = require('xml2js');

fs.readFile('curriculo_latters_guilherme.xml', function(err, data) {

    if (err){
        console.log("Erro ao ler o arquivo XML", err)
        return
    }
    
    xml2js.parseString(data, function (err, result) {
        
    if (err){
        console.log("Erro ao analisar o arquivo XML", err)
        return
    }

    //Acessando e extraindo os dados dentro da tag CURRICULO-VITAE
    const numeroIdentificador = result['CURRICULO-VITAE']['$']['NUMERO-IDENTIFICADOR'];

   
   // Acessando os dados dentro da tag DADOS-GERAIS
    const dadosGerais = result['CURRICULO-VITAE']['DADOS-GERAIS'][0];

    // Extraindo os valores dos atributos PARA A IDENTIDADE DO DOCENTE
    const nomeCompleto = dadosGerais['$']['NOME-COMPLETO'];
    const resumoCV = dadosGerais['RESUMO-CV'][0]['$']['TEXTO-RESUMO-CV-RH'];

    //Buscar a maior titulação
   
    // Níveis de titulação
    const titulacoes = {
        1: 'Graduação',
        2: 'Especialização',
        3: 'Mestrado',
        4: 'Doutorado'
    };

    const formacao = dadosGerais['FORMACAO-ACADEMICA-TITULACAO'][0];
    const niveis = {};

    // Percorre os diferentes níveis de titulação
    ['GRADUACAO', 'MESTRADO', 'DOUTORADO'].forEach((nivel) => {
        if (formacao[nivel]) {
            niveis[nivel] = formacao[nivel][0]['$']['NIVEL'];
        }
    });

    const maiorNivel = Math.max(...Object.values(niveis));

        //Docente
        const docente = {
            numeroIdentificador:numeroIdentificador,
            name: nomeCompleto,
            resumo:resumoCV,
            titulacao:titulacoes [maiorNivel],
            //Área de atuação(FK)  
        }
        console.log('Docente' ,docente)
 
    
    //IDENTIDADE ÁREA DE ATUAÇÃO
    const nomeDaAreaDeAtucao = dadosGerais['AREAS-DE-ATUACAO'][0]['AREA-DE-ATUACAO'][0]['$']['NOME-DA-AREA-DO-CONHECIMENTO'];
    const nomeDaEspecialidade = dadosGerais['AREAS-DE-ATUACAO'][0]['AREA-DE-ATUACAO'][0]['$']['NOME-DA-ESPECIALIDADE'];

    const areaDeAtuacao={
        nomeDaAreaDeAtucao:nomeDaAreaDeAtucao ,
        nomeDaEspecialidade:nomeDaEspecialidade , 
    }

    console.log('Área de atuação',areaDeAtuacao)


    
    //IDENTIDADE ATUAÇÃO PROFISSIONAL E IDENTIDADE PROJETO //IDENTIDADE MEMBRO E FINANCIADORES DO PROJETO
    let projetosData = [];
    let membrosData = [];
    let financiadoresData =[];
    const atuacoesData = dadosGerais['ATUACOES-PROFISSIONAIS'][0]['ATUACAO-PROFISSIONAL'].map(atuacao => {
         projetosData = atuacao['ATIVIDADES-DE-PARTICIPACAO-EM-PROJETO'] ? atuacao['ATIVIDADES-DE-PARTICIPACAO-EM-PROJETO'][0]['PARTICIPACAO-EM-PROJETO'].map(projeto => {
            const membros = projeto['PROJETO-DE-PESQUISA'][0]['EQUIPE-DO-PROJETO'] ? projeto['PROJETO-DE-PESQUISA'][0]['EQUIPE-DO-PROJETO'][0]['INTEGRANTES-DO-PROJETO']
                .map(membro=>({
                    nome: membro['$']['NOME-COMPLETO'],
                    ordem: membro['$']['ORDEM-DE-INTEGRACAO'],
                    flagResponsavel: membro['$']['FLAG-RESPONSAVEL'],
                
                })):[]
                membrosData.push(membros);

            const financiadorData = projeto['PROJETO-DE-PESQUISA'][0]['FINANCIADORES-DO-PROJETO'] ? projeto['PROJETO-DE-PESQUISA'][0]['FINANCIADORES-DO-PROJETO'][0]['FINANCIADOR-DO-PROJETO']
                .map(financiador => ({
                    sequenciaFinanciador: financiador['$']['SEQUENCIA-FINANCIADOR'],
                    codigoInstituicao: financiador['$']['CODIGO-INSTITUICAO'],
                    nomeInstituicao: financiador['$']['NOME-INSTITUICAO'],
                    natureza: financiador['$']['NATUREZA']
                })):[]
                financiadoresData.push(financiadorData)

            return{
            inicio: projeto['$']['ANO-INICIO'],
            fim: projeto['$']['ANO-FIM'],
            nome: projeto['PROJETO-DE-PESQUISA'][0]['$']['NOME-DO-PROJETO'],
            natureza: projeto['PROJETO-DE-PESQUISA'][0]['$']['NATUREZA'],
            situacao: projeto['PROJETO-DE-PESQUISA'][0]['$']['SITUACAO'],
            descricao: projeto['PROJETO-DE-PESQUISA'][0]['$']['DESCRICAO-DO-PROJETO'],
            membros:membros,
            financiador: financiadorData
            }
        }  
        ) : [];
        return {
            codigoInstituicao: atuacao['$']['CODIGO-INSTITUICAO'],
            nome: atuacao['$']['NOME-INSTITUICAO'],
            projetos: projetosData
        };
    });

    const atuacaoProfissional= {
        ...atuacoesData

    }
    console.log('Atuação Profissional')
    console.dir(atuacaoProfissional, { depth: null });


    //IDENTIDADE PRODUÇÃO
    const producaoBibliografica = result['CURRICULO-VITAE']['PRODUCAO-BIBLIOGRAFICA'][0]
    

    const trabalhoEmEventosData = producaoBibliografica['TRABALHOS-EM-EVENTOS'][0]['TRABALHO-EM-EVENTOS'].map(trabalho=>{      
        const membros= trabalho['AUTORES'].map(membro=>({
            nome : membro['$']['NOME-COMPLETO-DO-AUTOR'],
            ordem: membro['$']['ORDEM-DE-AUTORIA'],
        }))
        
        return{
        sequencia:trabalho['$']['SEQUENCIA-PRODUCAO'],
        natureza:trabalho['DADOS-BASICOS-DO-TRABALHO'][0]['$']['NATUREZA'],
        titulo:trabalho['DADOS-BASICOS-DO-TRABALHO'][0]['$']['TITULO-DO-TRABALHO'],
        ano:trabalho['DADOS-BASICOS-DO-TRABALHO'][0]['$']['ANO-DO-TRABALHO'],
        membros: membros
        }
    })
    console.log("Trabalhos em eventos",trabalhoEmEventosData)

    const artigoPublicadoData = producaoBibliografica['ARTIGOS-PUBLICADOS'][0]['ARTIGO-PUBLICADO'].map(artigo=>{      
        const membros= artigo['AUTORES'].map(membro=>({
            nome : membro['$']['NOME-COMPLETO-DO-AUTOR'],
            ordem: membro['$']['ORDEM-DE-AUTORIA'],
        }))
        
        return{
        sequencia:artigo['$']['SEQUENCIA-PRODUCAO'],
        natureza:artigo['DADOS-BASICOS-DO-ARTIGO'][0]['$']['NATUREZA'],
        titulo:artigo['DADOS-BASICOS-DO-ARTIGO'][0]['$']['TITULO-DO-ARTIGO'],
        ano:artigo['DADOS-BASICOS-DO-ARTIGO'][0]['$']['ANO-DO-ARTIGO'],
        membros: membros
        }
    })
    console.log("Artigos Publicados",artigoPublicadoData)

    const outrasProducoesDataData = producaoBibliografica['DEMAIS-TIPOS-DE-PRODUCAO-BIBLIOGRAFICA'][0]['OUTRA-PRODUCAO-BIBLIOGRAFICA'].map(producao=>{      
        const membros= producao['AUTORES'].map(membro=>({
            nome : membro['$']['NOME-COMPLETO-DO-AUTOR'],
            ordem: membro['$']['ORDEM-DE-AUTORIA'],
        }))
        
        return{
        sequencia:producao['$']['SEQUENCIA-PRODUCAO'],
        natureza:producao['DADOS-BASICOS-DE-OUTRA-PRODUCAO'][0]['$']['NATUREZA'],
        titulo:producao['DADOS-BASICOS-DE-OUTRA-PRODUCAO'][0]['$']['TITULO'],
        ano:producao['DADOS-BASICOS-DE-OUTRA-PRODUCAO'][0]['$']['ANO'],
        membros: membros
        }
    })
    console.log("Outras Produções =  ",outrasProducoesDataData)





   



    //PRODUÇÃO TÉCNICA
    const producaoTecnica = result['CURRICULO-VITAE']['PRODUCAO-TECNICA'][0]
    const softwareData = producaoTecnica['SOFTWARE'].map(software=>{

        const membros= software['AUTORES'].map(membro=>({
            nome : membro['$']['NOME-COMPLETO-DO-AUTOR']
        }))

        return{
        sequencia:software['$']['SEQUENCIA-PRODUCAO'],
        natureza:software['DADOS-BASICOS-DO-SOFTWARE'][0]['$']['NATUREZA'],
        titulo:software['DADOS-BASICOS-DO-SOFTWARE'][0]['$']['TITULO-DO-SOFTWARE'],
        ano:software['DADOS-BASICOS-DO-SOFTWARE'][0]['$']['ANO'],
        finalidade: software['DETALHAMENTO-DO-SOFTWARE'][0]['$']['FINALIDADE'],
        nomeDoFinanciador: software['DETALHAMENTO-DO-SOFTWARE'][0]['$']['INSTITUICAO-FINANCIADORA'],
        membros: membros

        }

    })
     console.log("Produção Técnica Software ",softwareData)

    const trabalhoTecnicoData = producaoTecnica['TRABALHO-TECNICO'].map(trabalho=>{

        const membros= trabalho['AUTORES'].map(membro=>({
            nome : membro['$']['NOME-COMPLETO-DO-AUTOR']
        }))

        return{
        sequencia:trabalho['$']['SEQUENCIA-PRODUCAO'],
        natureza:trabalho['DADOS-BASICOS-DO-TRABALHO-TECNICO'][0]['$']['NATUREZA'],
        titulo:trabalho['DADOS-BASICOS-DO-TRABALHO-TECNICO'][0]['$']['TITULO-DO-TRABALHO-TECNICO'],
        ano:trabalho['DADOS-BASICOS-DO-TRABALHO-TECNICO'][0]['$']['ANO'],
        finalidade: trabalho['DETALHAMENTO-DO-TRABALHO-TECNICO'][0]['$']['FINALIDADE'],
        nomeDoFinanciador: trabalho['DETALHAMENTO-DO-TRABALHO-TECNICO'][0]['$']['INSTITUICAO-FINANCIADORA'],
        membros: membros

        }

    })
    console.log("Trabalho Técnico",trabalhoTecnicoData)

    //IDENTIDADE ORIENTAÇÕES
    const orietacoesConcluidas = result['CURRICULO-VITAE']['OUTRA-PRODUCAO'][0]['ORIENTACOES-CONCLUIDAS'][0]

    const orientacoesMestrado =  orietacoesConcluidas['ORIENTACOES-CONCLUIDAS-PARA-MESTRADO'].map(orientacao=>({
        sequencia:orientacao['$']['SEQUENCIA-PRODUCAO'],
        concluido:true,
        natureza:orientacao['DADOS-BASICOS-DE-ORIENTACOES-CONCLUIDAS-PARA-MESTRADO'][0]['$']['NATUREZA'],
        tipo:orientacao['DADOS-BASICOS-DE-ORIENTACOES-CONCLUIDAS-PARA-MESTRADO'][0]['$']['TIPO'],
        titulo:orientacao['DADOS-BASICOS-DE-ORIENTACOES-CONCLUIDAS-PARA-MESTRADO'][0]['$']['TITULO'],
        ano:orientacao['DADOS-BASICOS-DE-ORIENTACOES-CONCLUIDAS-PARA-MESTRADO'][0]['$']['ANO'],
        tipoDeOrientacao:orientacao['DETALHAMENTO-DE-ORIENTACOES-CONCLUIDAS-PARA-MESTRADO'][0]['$']['TIPO-DE-ORIENTACAO'],
        nomeDoOrientado:orientacao['DETALHAMENTO-DE-ORIENTACOES-CONCLUIDAS-PARA-MESTRADO'][0]['$']['NOME-DO-ORIENTADO'],
        idOrientado:orientacao['DETALHAMENTO-DE-ORIENTACOES-CONCLUIDAS-PARA-MESTRADO'][0]['$']['NUMERO-ID-ORIENTADO'],
        codigoInstituicao:orientacao['DETALHAMENTO-DE-ORIENTACOES-CONCLUIDAS-PARA-MESTRADO'][0]['$']['CODIGO-INSTITUICAO'],
        nomeInstituicao:orientacao['DETALHAMENTO-DE-ORIENTACOES-CONCLUIDAS-PARA-MESTRADO'][0]['$']['NOME-DA-INSTITUICAO'],
        codigoCurso:orientacao['DETALHAMENTO-DE-ORIENTACOES-CONCLUIDAS-PARA-MESTRADO'][0]['$']['CODIGO-CURSO'],
        nomeCurso:orientacao['DETALHAMENTO-DE-ORIENTACOES-CONCLUIDAS-PARA-MESTRADO'][0]['$']['NOME-DO-CURSO'],
        codigoAgenciaFinanciadora:orientacao['DETALHAMENTO-DE-ORIENTACOES-CONCLUIDAS-PARA-MESTRADO'][0]['$']['CODIGO-AGENCIA-FINANCIADORA'],
        nomeDaAgencia:orientacao['DETALHAMENTO-DE-ORIENTACOES-CONCLUIDAS-PARA-MESTRADO'][0]['$']['NOME-DA-AGENCIA'],

    }));
    console.log("Orientação do Mestrado",orientacoesMestrado)

    const outrasOrientacoes =  orietacoesConcluidas['OUTRAS-ORIENTACOES-CONCLUIDAS'].map(orientacao=>({
        sequencia:orientacao['$']['SEQUENCIA-PRODUCAO'],
        concluido:true,
        natureza:orientacao['DADOS-BASICOS-DE-OUTRAS-ORIENTACOES-CONCLUIDAS'][0]['$']['NATUREZA'],
        tipo:orientacao['DADOS-BASICOS-DE-OUTRAS-ORIENTACOES-CONCLUIDAS'][0]['$']['TIPO'],
        titulo:orientacao['DADOS-BASICOS-DE-OUTRAS-ORIENTACOES-CONCLUIDAS'][0]['$']['TITULO'],
        ano:orientacao['DADOS-BASICOS-DE-OUTRAS-ORIENTACOES-CONCLUIDAS'][0]['$']['ANO'],
        tipoDeOrientacao:orientacao['DETALHAMENTO-DE-OUTRAS-ORIENTACOES-CONCLUIDAS'][0]['$']['TIPO-DE-ORIENTACAO-CONCLUIDA'],
        nomeDoOrientado:orientacao['DETALHAMENTO-DE-OUTRAS-ORIENTACOES-CONCLUIDAS'][0]['$']['NOME-DO-ORIENTADO'],
        idOrientado:orientacao['DETALHAMENTO-DE-OUTRAS-ORIENTACOES-CONCLUIDAS'][0]['$']['NUMERO-ID-ORIENTADO'],
        codigoInstituicao:orientacao['DETALHAMENTO-DE-OUTRAS-ORIENTACOES-CONCLUIDAS'][0]['$']['CODIGO-INSTITUICAO'],
        nomeInstituicao:orientacao['DETALHAMENTO-DE-OUTRAS-ORIENTACOES-CONCLUIDAS'][0]['$']['NOME-DA-INSTITUICAO'],
        codigoCurso:orientacao['DETALHAMENTO-DE-OUTRAS-ORIENTACOES-CONCLUIDAS'][0]['$']['CODIGO-CURSO'],
        nomeCurso:orientacao['DETALHAMENTO-DE-OUTRAS-ORIENTACOES-CONCLUIDAS'][0]['$']['NOME-DO-CURSO'],
        codigoAgenciaFinanciadora:orientacao['DETALHAMENTO-DE-OUTRAS-ORIENTACOES-CONCLUIDAS'][0]['$']['CODIGO-AGENCIA-FINANCIADORA'],
        nomeDaAgencia:orientacao['DETALHAMENTO-DE-OUTRAS-ORIENTACOES-CONCLUIDAS'][0]['$']['NOME-DA-AGENCIA'],

    }));
     console.log("Outras Orientações",outrasOrientacoes)

    const dadosComplementares = result['CURRICULO-VITAE']['DADOS-COMPLEMENTARES'][0]
  

    const bancaMestrado =  dadosComplementares['PARTICIPACAO-EM-BANCA-TRABALHOS-CONCLUSAO'][0]['PARTICIPACAO-EM-BANCA-DE-MESTRADO'].map(banca=>{

        const membros = banca['PARTICIPANTE-BANCA'].map(membro=>({
            nome:membro['$']['NOME-COMPLETO-DO-PARTICIPANTE-DA-BANCA'],
            ordem:membro['$']['ORDEM-PARTICIPANTE'],
        }))
             
        return{
        sequencia:banca['$']['SEQUENCIA-PRODUCAO'],
        natureza:banca['DADOS-BASICOS-DA-PARTICIPACAO-EM-BANCA-DE-MESTRADO'][0]['$']['NATUREZA'],
        tipo:banca['DADOS-BASICOS-DA-PARTICIPACAO-EM-BANCA-DE-MESTRADO'][0]['$']['TIPO'],
        titulo:banca['DADOS-BASICOS-DA-PARTICIPACAO-EM-BANCA-DE-MESTRADO'][0]['$']['TITULO'],
        ano:banca['DADOS-BASICOS-DA-PARTICIPACAO-EM-BANCA-DE-MESTRADO'][0]['$']['ANO'],
        nomeDoCandidato:banca['DETALHAMENTO-DA-PARTICIPACAO-EM-BANCA-DE-MESTRADO'][0]['$']['NOME-DO-CANDIDATO'],
        codigoInstituicao:banca['DETALHAMENTO-DA-PARTICIPACAO-EM-BANCA-DE-MESTRADO'][0]['$']['CODIGO-INSTITUICAO'],
        nomeInstituicao:banca['DETALHAMENTO-DA-PARTICIPACAO-EM-BANCA-DE-MESTRADO'][0]['$']['NOME-INSTITUICAO'],
        codigoCurso:banca['DETALHAMENTO-DA-PARTICIPACAO-EM-BANCA-DE-MESTRADO'][0]['$']['CODIGO-CURSO'],
        nomeCurso:banca['DETALHAMENTO-DA-PARTICIPACAO-EM-BANCA-DE-MESTRADO'][0]['$']['NOME-CURSO'],
        membros:membros
        }

    });
    console.log("Banca Mestrado",bancaMestrado)

    const bancaExame =  dadosComplementares['PARTICIPACAO-EM-BANCA-TRABALHOS-CONCLUSAO'][0]['PARTICIPACAO-EM-BANCA-DE-EXAME-QUALIFICACAO'].map(banca=>{

        const membros = banca['PARTICIPANTE-BANCA'].map(membro=>({
            nome:membro['$']['NOME-COMPLETO-DO-PARTICIPANTE-DA-BANCA'],
            ordem:membro['$']['ORDEM-PARTICIPANTE'],
        }))
             
        return{
        sequencia:banca['$']['SEQUENCIA-PRODUCAO'],
        natureza:banca['DADOS-BASICOS-DA-PARTICIPACAO-EM-BANCA-DE-EXAME-QUALIFICACAO'][0]['$']['NATUREZA'],
        titulo:banca['DADOS-BASICOS-DA-PARTICIPACAO-EM-BANCA-DE-EXAME-QUALIFICACAO'][0]['$']['TITULO'],
        ano:banca['DADOS-BASICOS-DA-PARTICIPACAO-EM-BANCA-DE-EXAME-QUALIFICACAO'][0]['$']['ANO'],
        nomeDoCandidato:banca['DETALHAMENTO-DA-PARTICIPACAO-EM-BANCA-DE-EXAME-QUALIFICACAO'][0]['$']['NOME-DO-CANDIDATO'],
        codigoInstituicao:banca['DETALHAMENTO-DA-PARTICIPACAO-EM-BANCA-DE-EXAME-QUALIFICACAO'][0]['$']['CODIGO-INSTITUICAO'],
        nomeInstituicao:banca['DETALHAMENTO-DA-PARTICIPACAO-EM-BANCA-DE-EXAME-QUALIFICACAO'][0]['$']['NOME-INSTITUICAO'],
        codigoCurso:banca['DETALHAMENTO-DA-PARTICIPACAO-EM-BANCA-DE-EXAME-QUALIFICACAO'][0]['$']['CODIGO-CURSO'],
        nomeCurso:banca['DETALHAMENTO-DA-PARTICIPACAO-EM-BANCA-DE-EXAME-QUALIFICACAO'][0]['$']['NOME-CURSO'],
        membros:membros
        }

    });
    console.log("Banca Exame",bancaExame)


    const bancaGraduacao =  dadosComplementares['PARTICIPACAO-EM-BANCA-TRABALHOS-CONCLUSAO'][0]['PARTICIPACAO-EM-BANCA-DE-GRADUACAO'].map(banca=>{
        

        const membros = banca['PARTICIPANTE-BANCA'].map(membro=>({
            nome:membro['$']['NOME-COMPLETO-DO-PARTICIPANTE-DA-BANCA'],
            ordem:membro['$']['ORDEM-PARTICIPANTE'],
        }))
             
        return{
        sequencia:banca['$']['SEQUENCIA-PRODUCAO'],
        natureza:banca['DADOS-BASICOS-DA-PARTICIPACAO-EM-BANCA-DE-GRADUACAO'][0]['$']['NATUREZA'],
        titulo:banca['DADOS-BASICOS-DA-PARTICIPACAO-EM-BANCA-DE-GRADUACAO'][0]['$']['TITULO'],
        ano:banca['DADOS-BASICOS-DA-PARTICIPACAO-EM-BANCA-DE-GRADUACAO'][0]['$']['ANO'],
        nomeDoCandidato:banca['DETALHAMENTO-DA-PARTICIPACAO-EM-BANCA-DE-GRADUACAO'][0]['$']['NOME-DO-CANDIDATO'],
        codigoInstituicao:banca['DETALHAMENTO-DA-PARTICIPACAO-EM-BANCA-DE-GRADUACAO'][0]['$']['CODIGO-INSTITUICAO'],
        nomeInstituicao:banca['DETALHAMENTO-DA-PARTICIPACAO-EM-BANCA-DE-GRADUACAO'][0]['$']['NOME-INSTITUICAO'],
        codigoCurso:banca['DETALHAMENTO-DA-PARTICIPACAO-EM-BANCA-DE-GRADUACAO'][0]['$']['CODIGO-CURSO'],
        nomeCurso:banca['DETALHAMENTO-DA-PARTICIPACAO-EM-BANCA-DE-GRADUACAO'][0]['$']['NOME-CURSO'],
        membros:membros
        }

    });
    console.log("Banca Graduação",bancaGraduacao)

    
   

    const orietacoesEmAndamento = dadosComplementares['ORIENTACOES-EM-ANDAMENTO'][0]

    const orientacaoEmAndamentoMestrado = orietacoesEmAndamento['ORIENTACAO-EM-ANDAMENTO-DE-MESTRADO'].map(orientacao=>({
        sequencia:orientacao['$']['SEQUENCIA-PRODUCAO'],
        concluido:false,
        natureza:orientacao['DADOS-BASICOS-DA-ORIENTACAO-EM-ANDAMENTO-DE-MESTRADO'][0]['$']['NATUREZA'],
        tipo:orientacao['DADOS-BASICOS-DA-ORIENTACAO-EM-ANDAMENTO-DE-MESTRADO'][0]['$']['TIPO'],
        titulo:orientacao['DADOS-BASICOS-DA-ORIENTACAO-EM-ANDAMENTO-DE-MESTRADO'][0]['$']['TITULO-DO-TRABALHO'],
        ano:orientacao['DADOS-BASICOS-DA-ORIENTACAO-EM-ANDAMENTO-DE-MESTRADO'][0]['$']['ANO'],
        tipoDeOrientacao:orientacao['DETALHAMENTO-DA-ORIENTACAO-EM-ANDAMENTO-DE-MESTRADO'][0]['$']['TIPO-DE-ORIENTACAO'],
        nomeDoOrientando:orientacao['DETALHAMENTO-DA-ORIENTACAO-EM-ANDAMENTO-DE-MESTRADO'][0]['$']['NOME-DO-ORIENTANDO'],
        idOrientado:orientacao['DETALHAMENTO-DA-ORIENTACAO-EM-ANDAMENTO-DE-MESTRADO'][0]['$']['NUMERO-ID-ORIENTADO'],
        codigoInstituicao:orientacao['DETALHAMENTO-DA-ORIENTACAO-EM-ANDAMENTO-DE-MESTRADO'][0]['$']['CODIGO-INSTITUICAO'],
        nomeInstituicao:orientacao['DETALHAMENTO-DA-ORIENTACAO-EM-ANDAMENTO-DE-MESTRADO'][0]['$']['NOME-INSTITUICAO'],
        codigoCurso:orientacao['DETALHAMENTO-DA-ORIENTACAO-EM-ANDAMENTO-DE-MESTRADO'][0]['$']['CODIGO-CURSO'],
        nomeCurso:orientacao['DETALHAMENTO-DA-ORIENTACAO-EM-ANDAMENTO-DE-MESTRADO'][0]['$']['NOME-CURSO'],
        codigoAgenciaFinanciadora:orientacao['DETALHAMENTO-DA-ORIENTACAO-EM-ANDAMENTO-DE-MESTRADO'][0]['$']['CODIGO-AGENCIA-FINANCIADORA'],
        nomeDaAgencia:orientacao['DETALHAMENTO-DA-ORIENTACAO-EM-ANDAMENTO-DE-MESTRADO'][0]['$']['NOME-DA-AGENCIA'],

    }
))
    console.log('Orientações em Andamento de Mestrado',orientacaoEmAndamentoMestrado)

    const orientacaoEmAndamentoDoutorado = orietacoesEmAndamento['ORIENTACAO-EM-ANDAMENTO-DE-DOUTORADO'].map(orientacao=>({
        sequencia:orientacao['$']['SEQUENCIA-PRODUCAO'],
        concluido:false,
        natureza:orientacao['DADOS-BASICOS-DA-ORIENTACAO-EM-ANDAMENTO-DE-DOUTORADO'][0]['$']['NATUREZA'],
        // tipo:orientacao['DADOS-BASICOS-DA-ORIENTACAO-EM-ANDAMENTO-DE-DOUTORADO'][0]['$']['TIPO'],
        titulo:orientacao['DADOS-BASICOS-DA-ORIENTACAO-EM-ANDAMENTO-DE-DOUTORADO'][0]['$']['TITULO-DO-TRABALHO'],
        ano:orientacao['DADOS-BASICOS-DA-ORIENTACAO-EM-ANDAMENTO-DE-DOUTORADO'][0]['$']['ANO'],
        tipoDeOrientacao:orientacao['DETALHAMENTO-DA-ORIENTACAO-EM-ANDAMENTO-DE-DOUTORADO'][0]['$']['TIPO-DE-ORIENTACAO'],
        nomeDoOrientando:orientacao['DETALHAMENTO-DA-ORIENTACAO-EM-ANDAMENTO-DE-DOUTORADO'][0]['$']['NOME-DO-ORIENTANDO'],
        idOrientando:orientacao['DETALHAMENTO-DA-ORIENTACAO-EM-ANDAMENTO-DE-DOUTORADO'][0]['$']['NUMERO-ID-ORIENTANDO'],
        codigoInstituicao:orientacao['DETALHAMENTO-DA-ORIENTACAO-EM-ANDAMENTO-DE-DOUTORADO'][0]['$']['CODIGO-INSTITUICAO'],
        nomeInstituicao:orientacao['DETALHAMENTO-DA-ORIENTACAO-EM-ANDAMENTO-DE-DOUTORADO'][0]['$']['NOME-INSTITUICAO'],
        codigoCurso:orientacao['DETALHAMENTO-DA-ORIENTACAO-EM-ANDAMENTO-DE-DOUTORADO'][0]['$']['CODIGO-CURSO'],
        nomeCurso:orientacao['DETALHAMENTO-DA-ORIENTACAO-EM-ANDAMENTO-DE-DOUTORADO'][0]['$']['NOME-CURSO'],
        codigoAgenciaFinanciadora:orientacao['DETALHAMENTO-DA-ORIENTACAO-EM-ANDAMENTO-DE-DOUTORADO'][0]['$']['CODIGO-AGENCIA-FINANCIADORA'],
        nomeDaAgencia:orientacao['DETALHAMENTO-DA-ORIENTACAO-EM-ANDAMENTO-DE-DOUTORADO'][0]['$']['NOME-DA-AGENCIA'],

    }
))
    console.log('Orientações em Andamento de Doutorado',orientacaoEmAndamentoDoutorado)


    const orientacaoEmAndamentoInciacao = orietacoesEmAndamento['ORIENTACAO-EM-ANDAMENTO-DE-INICIACAO-CIENTIFICA'].map(orientacao=>({
        sequencia:orientacao['$']['SEQUENCIA-PRODUCAO'],
        concluido:false,
        natureza:orientacao['DADOS-BASICOS-DA-ORIENTACAO-EM-ANDAMENTO-DE-INICIACAO-CIENTIFICA'][0]['$']['NATUREZA'],
        titulo:orientacao['DADOS-BASICOS-DA-ORIENTACAO-EM-ANDAMENTO-DE-INICIACAO-CIENTIFICA'][0]['$']['TITULO-DO-TRABALHO'],
        ano:orientacao['DADOS-BASICOS-DA-ORIENTACAO-EM-ANDAMENTO-DE-INICIACAO-CIENTIFICA'][0]['$']['ANO'],
        nomeDoOrientando:orientacao['DETALHAMENTO-DA-ORIENTACAO-EM-ANDAMENTO-DE-INICIACAO-CIENTIFICA'][0]['$']['NOME-DO-ORIENTANDO'],
        idOrientando:orientacao['DETALHAMENTO-DA-ORIENTACAO-EM-ANDAMENTO-DE-INICIACAO-CIENTIFICA'][0]['$']['NUMERO-ID-ORIENTANDO'],
        codigoInstituicao:orientacao['DETALHAMENTO-DA-ORIENTACAO-EM-ANDAMENTO-DE-INICIACAO-CIENTIFICA'][0]['$']['CODIGO-INSTITUICAO'],
        nomeInstituicao:orientacao['DETALHAMENTO-DA-ORIENTACAO-EM-ANDAMENTO-DE-INICIACAO-CIENTIFICA'][0]['$']['NOME-INSTITUICAO'],
        codigoCurso:orientacao['DETALHAMENTO-DA-ORIENTACAO-EM-ANDAMENTO-DE-INICIACAO-CIENTIFICA'][0]['$']['CODIGO-CURSO'],
        nomeCurso:orientacao['DETALHAMENTO-DA-ORIENTACAO-EM-ANDAMENTO-DE-INICIACAO-CIENTIFICA'][0]['$']['NOME-CURSO'],
        codigoAgenciaFinanciadora:orientacao['DETALHAMENTO-DA-ORIENTACAO-EM-ANDAMENTO-DE-INICIACAO-CIENTIFICA'][0]['$']['CODIGO-AGENCIA-FINANCIADORA'],
        nomeDaAgencia:orientacao['DETALHAMENTO-DA-ORIENTACAO-EM-ANDAMENTO-DE-INICIACAO-CIENTIFICA'][0]['$']['NOME-DA-AGENCIA'],

    }
))
    console.log('Orientações em Andamento de Iniciação Científica',orientacaoEmAndamentoInciacao)

    //INFORMAÇÃOES COMPLEMENTARES








    });

});