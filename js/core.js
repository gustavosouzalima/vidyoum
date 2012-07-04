var numeroVideo = [],
    marcados = [];
// o nome das tabelas do localStorage estao definidas no db.js

// Salva caminho da pasta de video
$("#salvarcaminhovideo").click(function() {
    var caminhoInserido = $("#pastadosvideos").val();
    var nomeInserido = $("#nomeplaylist").val();
    caminhoCorrigido = caminhoInserido.split(' ').join('%20');
    // atualiza o caminho desejado para a playlist
    var caminhoPlaylist = [];
    caminhoPlaylist = db.query("pastavideo");
    var novaPlaylist = caminhoPlaylist.length;

    playlist = novaPlaylist + 1;
    // grava a pasta de videos vinculando a uma playlist criada
    db.insert("pastavideo", {numeroplaylist: playlist, caminho: caminhoCorrigido, nomedaplaylist: nomeInserido});
    // gravo qual a pasta de playlist atual para usar adiante
    db.insert("pastavideoatual", {numeroplaylist: playlist});

    db.commit();

    $("#mostradragdrop").fadeIn();
    $('body').scrollTop(500);
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
}

// adiciona os videos na playlist
function criaPlaylist(videos, playlist) {
    $("#lista_videos p").remove();
    var listaVideos = videos + 1;
    for (var i = 1;i<listaVideos;i++) {
        $("#lista_videos").append('<p><input type="checkbox" value='+i+'  name="checks'+playlist+'"> <span>'+i+'</span> <a class="play" value='+i+' onclick="play('+i+", "+playlist+')">▶</a><a class="pause" onclick="pause()"><strong>II</strong></a></p>');
    }
}

// adiciona os videos na playlist
function editaPlaylist(playlist) {
    var playlists = db.query("pastavideo", {numeroplaylist: playlist});
    var playlistName = playlists[0]["nomedaplaylist"];
    // quando carregada a playlist adiciona o botao de limpar a playlist existente
    $("#listaplaylist").hide();

    $("#edita-playlist").append('<div id="modificaplaylist"><h3>Renomear playlist</h3><input type="text" value="'+playlistName+'" ><a id="salvaplaylist" class="g-button green" onclick="renomeiaPlaylist('+playlist+'); window.location.reload( true );">Salvar</a><h3>Adicionar mais vídeos a playlist</h3><div id="drop_zone_edit" webkitdirectory><div id="borda"><i class="cloud"></i><span>Arraste seus videos para cá</span></div></div></div>');
    $("#edita-playlist > #modificaplaylist").append('<br /><br /><a id="removeplaylist" class="g-button red" onclick="deletaDB('+playlist+'); window.location.reload( true );">Remover essa playlist</a>');
    $("#edita-playlist > #modificaplaylist").append('<br /><br /><a id="editarplaylistvoltar" class="g-button blue" > < Voltar</a>');

    $("a#editarplaylistvoltar").click(function() {
        console.log("teste")
        $("#modificaplaylist").remove();
        $("#listaplaylist").fadeIn();
    });
    $('body').scrollTop(500);

    // Setup the dnd listeners.
    var dropZone = document.getElementById('drop_zone_edit');
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('dragleave', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelectEdit, false);

    db.update("videoateofim", {ID: 1}, function(row) {
        row.numeroplaylist = playlist;
        return row;
    });
    db.commit();
}

// adiciona os videos na playlist
function renomeiaPlaylist(playlist) {
    var nomedaplaylist = $("#edita-playlist > input").val();
    // atualiza o banco
    db.update("pastavideo", {numeroplaylist: playlist}, function(row) {
        row.nomedaplaylist = nomedaplaylist;
        return row;
    });
    db.commit();
}

// chamado quando colocado arquivos no drag and drop numa playlist existente
function handleFileSelectEdit(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var ultimotocado = db.query("videoateofim", {ID: 1}),
        playlist = ultimotocado[0]['numeroplaylist'];

    var files = evt.dataTransfer.files; // FileList object.
    // Adiciona lista de videos colocadas no drag and drop na playlist
    for (var i = 0, f; f = files[i]; i++) {
        if (f.type == "video/webm" || f.type == "video/ogg" || f.type == "video/mp4") {
            // quantidade de videos carregados no drop and down
            quantidadeVideos = i + 1;
            // adiciona os videos em uma playlist já existente no localStorage
            // TENHO QUE CONSERTAR ISSO!
            db.insert("video", {numeroplaylist: playlist, arquivovideo: escape(f.name)});
            db.commit();
        } else {
            // chama notificacao
            notificacaoErro('<h3>O arquivo <strong><u>' + escape(f.name) + '</u></strong> não é um formato aceito.</h3>');
        }
    }

    // remove a classe responsavel para estilizacao da playlist de videos
    var numeroVideos = db.query("video", {numeroplaylist: playlist});
    // chama notificacao
    if(quantidadeVideos > 1){
        notificacaoAcerto('<h3>Foram adicionados <strong><u>' + quantidadeVideos + '</u></strong> vídeos.</h3>');
    } else {
        notificacaoAcerto('<h3>Foi adicionado <strong><u>' + quantidadeVideos + '</u></strong> vídeo.</h3>');
    }
    // remove estilizacao da borda do hover no drag and drop
    $("#borda").removeClass("hover");
    window.location.reload( true );
}

// chamado quando colocado arquivos no drag and drop
function handleFileSelect(evt) {
    caminhoPlaylist = db.query("pastavideo");
    var playlist = caminhoPlaylist.length;
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
        // chama notificacao
        if(quantidadeVideos > 1){
            notificacaoAcerto('<h3>Foram adicionados <strong><u>' + quantidadeVideos + '</u></strong> vídeos.</h3>');
        } else {
            notificacaoAcerto('<h3>Foi adicionado <strong><u>' + quantidadeVideos + '</u></strong> vídeo.</h3>');
        }
        // remove estilizacao da borda do hover no drag and drop
        $("#borda").removeClass("hover");
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

function searchVideo(video, playlist) {
    var videoNumber = parseInt(video)-1;
    // No html5 eu deixo o video com a opcao preload="auto" para poder carregar o video que eu mudo aqui
    var caminhoDoVideo = db.query("pastavideo", {numeroplaylist: playlist});
    var arquivoVideo = gerarListaVideos(playlist);

    // caminho completo ate o arquivo de video "caminho + nomedoarquivo"
    caminhoCompleto = caminhoDoVideo[0]['caminho'] + "/" + arquivoVideo[videoNumber];

    _V_("video").ready(function(){
        var myPlayer = this;
        type = arquivoVideo[videoNumber].split(".");

        myPlayer.src({ type: "video/" + type[1], src: caminhoCompleto });
    });
    // document.getElementsByTagName('video')[0].src = caminhoCompleto;
    // chamo a notificacao
    notificacaoPlay('<h3>Assistindo o vídeo ' + videoNumber + '</h3>');
    nomedovideo = arquivoVideo[videoNumber].split('%20').join(' ');
    // insiro no html qual video está sendo tocado
    $("#statusvideo").html('Assistindo o vídeo').removeClass("parado").addClass("assistindo");
    $("#assistindovideo").html('<h3>'+nomedovideo+'</h3>').addClass("assistindo");
}

var videoAteFinal = function(){
    var ultimotocado = db.query("videoateofim", {ID: 1}),
        playlist = ultimotocado[0]['numeroplaylist'],
        ultimovideo = ultimotocado[0]['ultimotocado'];

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
    // chama o proximo video da lista
    if(ultimovideo < (videoassistido.length)){
        setTimeout('play('+(ultimovideo+1)+', '+playlist+')', 500);
    }
};

function setOndeparou() {
    _V_("video").ready(function(){
        var myPlayer = this,
            tempoCorridoVideo = myPlayer.currentTime(),
            meuvideo = db.query("videoateofim", {ID: 1});

        var arquivoVideo = gerarListaVideos(meuvideo[0]['numeroplaylist']);

        var videoName = arquivoVideo[meuvideo[0]['ultimotocado'] - 1]

        db.update("video", {arquivovideo: videoName}, function(row) {
            row.ondeparou = tempoCorridoVideo;
            return row;

        });
        db.commit();
    });
}

function comecaDeOndeparou(video, playlist) {
    // TODO: separara geracao da lista de videos em uma funcao
    var arquivoVideo = gerarListaVideos(playlist);

    videoName = arquivoVideo[video - 1];

    _V_("video").ready(function(){
        var myPlayer = this;

    dadosVideo = db.query("video", {arquivovideo: videoName})
    var ondeParou =  parseInt(dadosVideo[0]['ondeparou']);
    myPlayer.currentTime(ondeParou);
    myPlayer.addEvent("timeupdate", setOndeparou);
    });
}

// PLAY e PAUSE do video
function play(video, playlist) {

  _V_("video").ready(function(){
        var myPlayer = this;
        // verifico se o video que recebeu o comando "play" eh o mesmo de anteriormente
        dadosvideo = db.query("videoateofim", {ID: 1})
        var movie = document.getElementById('video');
        if (video == dadosvideo[0]["ultimotocado"] && playlist == dadosvideo[0]["numeroplaylist"]) {
            myPlayer.play();
        } else {
            // chama a lista de videos dinamicamente
            searchVideo(video, playlist);
            setTimeout('comecaDeOndeparou('+video+', '+playlist+')', 1000);
            myPlayer.play();
        }
        // guardo no localStorage qual o video que está tocando e passo para funcao videoAteFinal
        db.update("videoateofim", {ID: 1}, function(row) {
            row.numeroplaylist = playlist;
            row.ultimotocado = video;
            return row;
        });
        db.commit();

        myPlayer.addEvent("ended", videoAteFinal);
    });
};

function pause() {
  _V_("video").ready(function(){

      var myPlayer = this;
      myPlayer.pause();

    });
};

function mudaDeTab(i) {
    $("#playlists").jqxTabs("select", i);
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
    if(playlists.length > 0) {
        for (i in playlists) {
            // conta a quantidade de itens na tabela de videos existente no localStorage
            var playlistNumero = playlists[i]["numeroplaylist"];
            var playlistName = playlists[i]["nomedaplaylist"];
            // busco os videos pertencentes a playlist
            var videos = db.query("video", {numeroplaylist: playlistNumero});
            //playlists existentes
            $("#playlists-existentes").append('<a class="g-button blue nofloat playlist" onclick="criaPlaylist(' + videos.length + ", " + playlistNumero + '); mudaDeTab('+1+'); marcaVideo('+ playlistNumero + ');">'+ playlistName + '</a>');
            // lista playlists existentes para edita-las
            $("#listaplaylist").append('<a class="g-button blue nofloat playlist" onclick="editaPlaylist(' + playlistNumero + ');" >'+ playlistName + '</a>');
            }
            // quando carregada a playlist adiciona o botao de limpar a playlist existente
            if($("#listaplaylist > #removeplaylist").size() < 1) {
                $("#listaplaylist").append('<br /><a id="removeplaylist" class="g-button red" onclick="localStorage.clear(); window.location.reload( true );">Remove todas playlists</a>')
            }
            $("#listaplaylist").prepend('<h3>Clique para editar</h3>');
    }
    // toda vez que recarregar a pagina o ultimo video assistido sera removido do historico
    db.update("videoateofim", {ID: 1}, function(row) {
        row.numeroplaylist = 1;
        row.ultimotocado = " ";
        return row;
    });
    db.commit();

    // Setup the dnd listeners.
    var dropZone = document.getElementById('drop_zone');
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('dragleave', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);
}

// Funcoes de apoio

function gerarListaVideos(playlist) {
    /*
    Recebe uma playlist como parametro e gera uma lista com os videos da mesma
    */
    var listaVideos = []
    db.query("video", function(row) {  // a funcao de callback eh aplicada a cada coluna da tabela
        if(row.numeroplaylist == playlist) {
            listaVideos.push(row.arquivovideo);
        }
    });
    return listaVideos
}