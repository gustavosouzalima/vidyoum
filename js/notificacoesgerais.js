var corNotificacaoErro = "#CB3D2D",
	corNotificacaoACerto = "#359947",
	iconeErro = "./img/error.png",
	iconeAcerto = "./img/sucess.png",
	iconePlay = "./img/play.png";

function notificacaoAcerto(mensagem) {
	$.notify({
        inline: true,
        html: mensagem
    }, 5000);
    $(".notify_content:last").css("background", corNotificacaoACerto + ' url(' + iconeAcerto + ') 5% 50% no-repeat');
}

function notificacaoErro(mensagem) {
	$.notify({
        inline: true,
        html: mensagem
    }, 5000);
    $(".notify_content:last").css("background", corNotificacaoErro + ' url(' + iconeErro + ') 5% 50% no-repeat');
}

function notificacaoPlay(mensagem) {
	$.notify({
        inline: true,
        html: mensagem
    }, 5000);
    $(".notify_content:last").css("background", corNotificacaoACerto + ' url(' + iconePlay + ') 5% 50% no-repeat');
}

$('#salvarcaminhovideo').click(function(){
	caminhoInserido = $("#pastadosvideos").val();
	if(caminhoInserido.length > 0) {
		if(caminhoInserido[0] == "/"){
			caminhoParsed = caminhoInserido.split(' ').join('%20')
		    notificacaoAcerto('<h3>playlist salva para a pasta:</h3><p>'+caminhoInserido+'<p>');
		} else {
			notificacaoErro('<h3>A pasta com seus vídeos deve começar com barra "/"</h3>');
		}
	} else {
		notificacaoErro('<h3>Coloque a pasta com seus vídeos</h3>');
	}
	$("#pastadosvideos").val('');
    
});