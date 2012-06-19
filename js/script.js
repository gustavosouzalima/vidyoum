var nomeVideos = [],
    playlistVideo = [],
    numeroVideo = [],
    checks = [],
    videoList = [];
// o nome das tabelas do localStorage estao definidas no db.js

// Salva caminho da pasta de video
$("#salvarcaminhovideo").click(function() {
    var caminhoInserido = $("#pastadosvideos").val();
    caminhoCorrigido = caminhoInserido.split(' ').join('%20');
    // atualiza o caminho desejado para a playlist
    db.insert("pastavideo", {numeroplaylist: 1, caminho: caminhoCorrigido});
    db.insert("pastavideoatual", {numeroplaylist: 1});
    // db.commit();
});

function pastaVideosAtual() {
    existe = db.query("pastavideoatual", {numeroplaylist: 1});

    if(existe == false) {
        return false;
    } else {
        return true;
    }
}

function deletaDB() {
    db.truncate("video", {numeroplaylist: 1});
    db.truncate("checkbox", {numeroplaylist: 1});
    db.truncate("pastavideo", {numeroplaylist: 1});
    db.truncate("pastavideoatual", {numeroplaylist: 1});
    db.commit();
}

// Coloca e recupera do localStorage o que foi marcado no checkbox
function marcaVideo() {

    db.query("checkbox", function(row) {  // a funcao de callback eh aplicada a cada coluna da tabela
        if(row.numeroplaylist == 1) {
            // teste.push(row.arquivovideo)
            checks = row.marcados;
        }
    });

    $('input:checkbox[name=checks]').each(function () {
        //init the checkbox
        $(this).prop("checked", checks[this.value]?true:false);
        $(this).change(function () {
            $('input:checkbox[name=checks]').each(function () {
                checks[this.value] = this.checked;
            });
            // CORRIGIR O PROBLEMA DE ESCREVER SEMPRE UMA NOVA LINHA
            existeChecks = false;
            if(existeChecks) {
                // atualizo no localStorage os videos marcados
                db.update("checkbox", {numeroplaylist: 1}, function(row) {
                    row.marcados = checks;
                    
                    // the update callback function returns to the modified record
                    return row;
                    db.commit();
                });
            } else {
                // insiro no localStorage os videos marcados
                db.insert("checkbox", {numeroplaylist: 1, marcados:checks});
                db.commit();
            }
        });
    });

    checks.shift()

    var marcados = []
    for(var i=0;i<checks.length;i++){
        if(checks[i]==true) {
            marcados.push(i)
            // removo a imagem poster do video-player
            $('img.vjs-poster').remove();
        }
    }

    if(marcados.length > 0  ) {
        // calcula qual o maior em posicao na playlist dos videos marcados
        var ultimoMarcado = Math.max.apply(Math, marcados);
        
        // chama a funcao que gera o video com caminho completo
        videoCompleto(ultimoMarcado);
        document.getElementsByTagName('video')[0].src = caminhoCompleto;
    }
}

// adiciona os videos na playlist
function criaPlaylist(value) {
    var videos = value + 1;
    for (var i = 1;i<videos;i++) {
        $("#lista_videos").append('<p><input type="checkbox" value='+i+'  name="checks"> <span>'+i+'</span> <button class="play" value='+i+' onclick="play(value)">▶</button><button class="pause" onclick="pause()"><strong>II</strong></button></p>');
    }
    // adiciona o botao de limpar a playlist existente
    $("#lista_videos").after('<button class="g-button red" onclick="deletaDB(); window.location.reload( true );">Limpar playlist</button>');
}

// chamado quando colocado arquivos no drag and drop
function handleFileSelect(evt) {
    // verifico se existe alguma playlist ativa
    if(pastaVideosAtual()) {

        evt.stopPropagation();
        evt.preventDefault();

        var files = evt.dataTransfer.files; // FileList object.

        // Adiciona lista de videos colocadas no drag and drop na playlist
        for (var i = 0, f; f = files[i]; i++) {
            if (f.type == "video/webm" || f.type == "video/ogg" || f.type == "video/mp4") {
                
                // quantidade de videos carregados no drop and down         
                quantidadeVideos = i + 1;
                // adiciona os videos em uma playlist no localStorage
                db.insert("video", {numeroplaylist: 1, arquivovideo: escape(f.name)});
                db.commit();
                // chama notificacao
                notificacaoAcerto('<h3>Foram adicionados <strong><u>' + (i + 1) + '</u></strong> vídeo(s).</h3>');
                
            } else {
                // chama notificacao
                notificacaoErro('<h3>O arquivo <strong><u>' + escape(f.name) + '</u></strong> não é um formato aceito.</h3>');
            }
        }
        // remove a classe responsavel para estilizacao da playlist de videos
        $("#lista_videos").html(" ").removeClass("colunaunica");
        // chama a funcao que cria a playlist no html
        criaPlaylist(quantidadeVideos);
        
        // remove estilizacao da borda do hover no drag and drop
        $("#borda").removeClass("hover");
        // adiciona a lista de videos marcados no localStorage
        marcaVideo();
    } else {
        // chama notificacao
        notificacaoErro('<h3>Você ainda não criou uma playlist.</h3>');
        // remove estilizacao da borda
        $("#borda").removeClass("hover");
    }
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    if(evt.type == "dragover") {
        $("#borda").addClass("hover");
    } else {
        $("#borda").removeClass("hover");
    }
    
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

function videoCompleto(value) {
    // No html5 eu deixo o video com a opcao preload="auto" para poder carregar o video que eu mudo aqui
    var caminhoDoVideo = db.query("pastavideo", {numeroplaylist: 1});
    
    var arquivoVideo = []

    db.query("video", function(row) {  // a funcao de callback eh aplicada a cada coluna da tabela
        if(row.numeroplaylist == 1) {
            arquivoVideo.push(row.arquivovideo);
        }
    });
    
    // verifico se esta chegando para o "valu" tipo numero
    if(value > 0) {
        // altero o type do video de acordo com o arquivo carregado
        type = arquivoVideo[value].split(".");
        $("video").attr("type","video/" + type[1] + '"');
    }
    // caminho completo ate o arquivo de video "caminho + nomedoarquivo"
    caminhoCompleto = caminhoDoVideo[0]['caminho'] + "/" + arquivoVideo[value];
}

function searchVideo(value) {
    var buttonValueInt = parseInt(value),
        videoNumber = buttonValueInt -1;
    // chama a funcao que gera o video com caminho completo
    videoCompleto(videoNumber);
    
    document.getElementsByTagName('video')[0].src = caminhoCompleto;
    notificacaoPlay('<h3>Assistindo o vídeo ' + buttonValueInt + '</h3>');
}

var videoAteFinal = function(){
    var myPlayer = this;

    foiateofim = db.query("videoateofim", {numeroplaylist: 1});

    $('input:checkbox[value='+foiateofim[0]['ultimomarcado']+']').attr('checked', true);
    $('input:checkbox[name=checks]').each(function () {
            checks[this.value] = this.checked;
        });
    console.log(checks)
    // atualizo o banco
    db.update("checkbox", {numeroplaylist: 1}, function(row) {
        row.marcados = checks;
        return row;
    });
    db.commit();
};

// PLAY e PAUSE do video
function play(value) {
    // chama a lista de videos dinamicamente
    searchVideo(value);

    // guardo no localStorage qual a posicao do video e passo para funcao videoAteFinal
    numeroVideo = value;
    db.update("videoateofim", {numeroplaylist: 1}, function(row) {
        row.ultimomarcado = numeroVideo;
        return row;
    });
    db.commit();

  _V_("video").ready(function(){

      var myPlayer = this;
      myPlayer.play();
      myPlayer.addEvent("ended", videoAteFinal);
    });
};

function pause() {
  _V_("video").ready(function(){

      var myPlayer = this;
      myPlayer.pause();

    });
};

// Deve carregar antes de tudo
onload = function () {
    // carrega o banco de dados
    bancoDeDados();

    // conta a quantidade de itens na tabela de videos existente no localStorage
    var numeroVideos = db.rowCount("video")

    if(numeroVideos > 0) {
        criaPlaylist(numeroVideos);
    } else {
        $("#lista_videos").html("<p>Nenhum vídeo foi adicionado. Por favor crie uma nova playlist</p>").addClass("colunaunica");
    }
    
    // adiciona a lista de videos marcados no localStorage`e coloca o ultimo video no video inicial
    marcaVideo();

    // Setup the dnd listeners.
    var dropZone = document.getElementById('drop_zone');
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('dragleave', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);
}