var numeroVideo = [],
    marcados = [];
// o nome das tabelas do localStorage estao definidas no db.js

// Salva caminho da pasta de video
$("#salvarcaminhovideo").click(function() {
    var caminhoInserido = $("#pastadosvideos").val();
    caminhoCorrigido = caminhoInserido.split(' ').join('%20');
    // atualiza o caminho desejado para a playlist
    var caminhoPlaylist = [];
    caminhoPlaylist = db.query("pastavideo");
    var novaPlaylist = caminhoPlaylist.length;
    
    playlist = novaPlaylist + 1;
    // grava a pasta de videos vinculando a uma playlist criada
    db.insert("pastavideo", {numeroplaylist: playlist, caminho: caminhoCorrigido});
    
    db.commit();
});

function deletaDB(playlist) {
    db.deleteRows("video", {numeroplaylist: playlist});
    db.deleteRows("pastavideo", {numeroplaylist: playlist});
    db.deleteRows("checkbox", {numeroplaylist: playlist});
    db.commit();
}

// Coloca e recupera do localStorage o que foi marcado no checkbox
function marcaVideo(playlist) {

    var checks = db.query("checkbox", {numeroplaylist: playlist});
    if (checks.length > 0) {    
        marcados = checks[0]['marcados'];
    } else {
        db.insert("checkbox", {numeroplaylist: playlist, marcados: " "});
    }

    $('input:checkbox[name="checks'+playlist+'"]').each(function () {
        //init the checkbox
        $(this).prop("checked", marcados[this.value]?true:false);
        $(this).change(function () {
            $('input:checkbox[name="checks'+playlist+'"]').each(function () {
                checks[this.value] = this.checked;
            });
            // atualizo no localStorage os videos marcados
            db.update("checkbox", {numeroplaylist: playlist}, function(row) {
                row.marcados = checks;
                return row;
            });
            db.commit();
        });
    });
    
    // var marcadostrue = [];
    // for(var i=0;i<marcados.length;i++){
    //     if(marcados[i]==true) {
    //         marcadostrue.push(i)
    //         // removo a imagem poster do video-player
    //         $('img.vjs-poster').remove();
    //     }
    // }

    // if(marcadostrue.length > 0  ) {
    //     // calcula qual o maior em posicao na playlist dos videos marcados
    //     var ultimoMarcado = Math.max.apply(Math, marcadostrue);
    //     // chama a funcao que gera o video com caminho completo
    //     videoCompleto(ultimoMarcado-1);
    //     document.getElementsByTagName('video')[0].src = caminhoCompleto;
    // }
}

// adiciona os videos na playlist
function criaPlaylist(videos, playlist) {
    $("#lista_videos p").remove();
    var listaVideos = videos + 1;
    for (var i = 1;i<listaVideos;i++) {
        $("#lista_videos").append('<p><input type="checkbox" value='+i+'  name="checks'+playlist+'"> <span>'+i+'</span> <a href="#button" class="play" value='+i+' onclick="play('+i+", "+playlist+')">▶</a><a href="#button" class="pause" onclick="pause()"><strong>II</strong></a></p>');
    }
    // adiciona o botao de limpar a playlist existente
    if($("#playlists > button").size() < 1 && (videos > 0)) {
        $("#playlists").append('<button class="g-button red" onclick="deletaDB('+playlist+'); window.location.reload( true );">Limpar playlists</button>')
    }
}

// chamado quando colocado arquivos no drag and drop
function handleFileSelect(evt) {
    caminhoPlaylist = db.query("pastavideo");
    var playlist = caminhoPlaylist.length;
    console.log(playlist)
    // verifico se existe alguma playlist ativa
    if(playlist > 0) {
        evt.stopPropagation();
        evt.preventDefault();

        if(playlist == 1) {
            var files = evt.dataTransfer.files; // FileList object.
            // Adiciona lista de videos colocadas no drag and drop na playlist
            for (var i = 0, f; f = files[i]; i++) {
                if (f.type == "video/webm" || f.type == "video/ogg" || f.type == "video/mp4") {
                    // quantidade de videos carregados no drop and down         
                    quantidadeVideos = i + 1;
                    // adiciona os videos em uma playlist no localStorage
                    db.insert("video", {numeroplaylist: playlist, arquivovideo: escape(f.name)});
                    db.commit();
                } else {
                    // chama notificacao
                    notificacaoErro('<h3>O arquivo <strong><u>' + escape(f.name) + '</u></strong> não é um formato aceito.</h3>');
                }
            }
            // remove a classe responsavel para estilizacao da playlist de videos
            var numeroVideos = db.query("video", {numeroplaylist: playlist});
        } else {
            var files = evt.dataTransfer.files; // FileList object.
            // Adiciona lista de videos colocadas no drag and drop na playlist
            for (var i = 0, f; f = files[i]; i++) {
                if (f.type == "video/webm" || f.type == "video/ogg" || f.type == "video/mp4") {
                    // quantidade de videos carregados no drop and down         
                    quantidadeVideos = i + 1;
                    // adiciona os videos em uma playlist no localStorage
                    db.insert("video", {numeroplaylist: playlist, arquivovideo: escape(f.name)});
                    db.commit();
                } else {
                    // chama notificacao
                    notificacaoErro('<h3>O arquivo <strong><u>' + escape(f.name) + '</u></strong> não é um formato aceito.</h3>');
                }
            }
            // remove a classe responsavel para estilizacao da playlist de videos
            var numeroVideos = db.query("video", {numeroplaylist: playlist});
        }
        // chama a funcao que cria a playlist no html
        // chama notificacao
        if(quantidadeVideos > 1){
            notificacaoAcerto('<h3>Foram adicionados <strong><u>' + quantidadeVideos + '</u></strong> vídeos.</h3>');
        } else {
            notificacaoAcerto('<h3>Foi adicionado <strong><u>' + quantidadeVideos + '</u></strong> vídeo.</h3>');
        }
        
        // remove estilizacao da borda do hover no drag and drop
        $("#borda").removeClass("hover");
        // chama a funcao que adiciona a lista de videos marcados no localStorage
        //marcaVideo();
    } else {
        // chama notificacao
        notificacaoErro('<h3>Você ainda não criou uma playlist.</h3>');
        // remove estilizacao da borda
        $("#borda").removeClass("hover");
    }
    window.location.reload( true );
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

function videoCompleto(video, playlist) {
    // No html5 eu deixo o video com a opcao preload="auto" para poder carregar o video que eu mudo aqui
    var caminhoDoVideo = db.query("pastavideo", {numeroplaylist: playlist});
    var arquivoVideo = []
    db.query("video", function(row) {  // a funcao de callback eh aplicada a cada coluna da tabela
        if(row.numeroplaylist == playlist) {
            arquivoVideo.push(row.arquivovideo);
        }
    });
    // verifico se esta chegando para o valor do tipo numero
    if(video > 0) {
        // altero o type do video de acordo com o arquivo carregado
        type = arquivoVideo[video].split(".");
        $("video").attr("type","video/" + type[1] + '"');
    }
    // caminho completo ate o arquivo de video "caminho + nomedoarquivo"
    caminhoCompleto = caminhoDoVideo[0]['caminho'] + "/" + arquivoVideo[video];
    // insiro no html qual video está sendo tocado
    nomedovideo = arquivoVideo[video].split('%20').join(' ');
    $("#statusvideo").html('Assistindo o vídeo').removeClass("parado").addClass("assistindo");
    $("#assistindovideo").html('<h3>'+nomedovideo+'</h3>').addClass("assistindo");
}

function searchVideo(video, playlist) {
    var buttonValueInt = parseInt(video),
        videoNumber = buttonValueInt -1;
    // chama a funcao que gera o video com caminho completo
    videoCompleto(videoNumber, playlist);
    
    document.getElementsByTagName('video')[0].src = caminhoCompleto;
    notificacaoPlay('<h3>Assistindo o vídeo ' + buttonValueInt + '</h3>');
}

var videoAteFinal = function(){
    var videoAtual = db.query("videoateofim", {ID: 1}),
        playlist = videoAtual[0]['numeroplaylist'],
        ultimovideo = videoAtual[0]['ultimomarcado'];

    var videoassistido = db.query("video", {numeroplaylist: playlist}),
        nomedovideo = videoassistido[ultimovideo-1]["arquivovideo"].split('%20').join(' ');

    $("#statusvideo").html('Último vídeo assistido').removeClass("assistindo");
    $("#assistindovideo").html('<h3>'+nomedovideo+'</h3>').removeClass("assistindo");

    var checks = db.query("checkbox", {numeroplaylist: playlist});
    $('input:checkbox[value='+ultimovideo+']').attr('checked', true);
    $('input:checkbox[name="checks'+playlist+'"]').each(function () {
        checks[this.value] = this.checked;
    });
    // atualizo o banco
    db.update("checkbox", {numeroplaylist: playlist}, function(row) {
        row.marcados = checks;
        return row;
    });
    db.commit();
};

// PLAY e PAUSE do video
function play(video, playlist) {
    // chama a lista de videos dinamicamente
    searchVideo(video, playlist);

    // guardo no localStorage qual o video que está tocando e passo para funcao videoAteFinal
    db.update("videoateofim", {ID: 1}, function(row) {
        row.numeroplaylist = playlist;
        row.ultimomarcado = video;
        
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

function mudaDeTab() {
    $("#playlists").jqxTabs("select", 1);
}

$("a#adicionaplaylist").click(function(){
    $("#caminhovideo").fadeIn();
});

// Deve carregar antes de tudo
onload = function () {
    // carrega o banco de dados
    bancoDeDados();
    
    $("#lista_videos").html("<p>Por favor carregue uma playlist já existente ou Crie uma nova</p>");
    $("#lista_videos > p").addClass("colunaunica");
    
    // carrega todas as playlists existentes
    var playlists = db.query("pastavideo");
    // criaPlaylist(playlists.length, 1);
    if(playlists.length > 0) {
        for (i in playlists) {
            console.log("sao "+playlists[i]["numeroplaylist"]+" playlist")
            // conta a quantidade de itens na tabela de videos existente no localStorage
            var videos = db.query("video", {numeroplaylist: playlists[i]["numeroplaylist"]});
            if(videos.length > 0) {
                console.log("sao "+videos.length+" videos")
                $("#playlists_existentes").append('<a class="g-button blue nofloat" onclick="criaPlaylist(' + videos.length + ", " + playlists[i]["numeroplaylist"] + '); mudaDeTab(); marcaVideo('+ playlists[i]["numeroplaylist"] + ');"> Playlist ' + playlists[i]["numeroplaylist"] + '</a>');
            }
        }
    }

    // adiciona a lista de videos marcados no localStorage e coloca o ultimo video no video inicial
    //marcaVideo();
    
    // Setup the dnd listeners.
    var dropZone = document.getElementById('drop_zone');
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('dragleave', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);
}