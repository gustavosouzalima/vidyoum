var db = new localStorageDB("playlist");

function bancoDeDados() {
    // Check if the database was just created. Useful for initial database setup
    if( db.isNew() ) {

        // Crio as tabelas
        db.createTable("video", ["numeroplaylist", "arquivovideo"]);
        db.createTable("pastavideo", ["numeroplaylist", "caminho"]);
        db.createTable("checkbox", ["numeroplaylist", "marcados"]);
        db.createTable("pastavideoatual", ["numeroplaylist"]);
        db.createTable("videoateofim", ["numeroplaylist", "ultimomarcado"]);
        
        // crio esses campos como default no inicio
        // db.insert("checkbox", {numeroplaylist: 1, marcados: " "});
        db.insert("videoateofim", {numeroplaylist: 1, ultimomarcado: " "});

        // commit the database to localStorage
        // all create/drop/insert/update/delete operations should be committed
        db.commit();
    }
    // db.insert("pastavideo", {numeroplaylist: 1, caminho: "/teste"});
    // db.commit();
    // pegar um campo regatado do banco
    // var teste = db.query("pastavideo", {numeroplaylist: 1})
    // foiateofim = db.query("checkbox", {numeroplaylist: 1});
    // console.log(foiateofim)
    // var teste1 = db.query("video", {numeroplaylist: 1})
    // console.log(teste1)

    // buscar e atualizar um campo
    // db.update("video", {numeroplaylist: 3}, function(row) {
    //     row.numeroplaylist = 4;
        
    //     // the update callback function returns to the modified record
    //     return row;
    // });
    // db.commit();

    // // atualizando caminho dos videos
    // db.update("pastavideo", {ID: 1}, function(row) {
    //     row.caminho = caminhoCorrigido;
    //     return row;
    // });

    // REMOVER LINHA QUE SEJA DA PLAYLIST 1
    // db.deleteRows("video", {numeroplaylist: 1});
    // db.commit();
    // PESQUISANDO E RETORNANDO VALOR
    // var caminhoDoVideo = db.query("checkbox", {ID: 1});
    // console.log(caminhoDoVideo)

}
// localStorage.clear()

