$(document).ready(function () {
  // tab playlist videos
  $('#playlists').jqxTabs({ width: 350 })
                 .jqxTabs({ selectedItem: 0 })
                 .jqxTabs({ animationType: 'fade' })
                 .jqxTabs({ selectionTracker:true});
  $('#playlists').bind('selected', function (event) {
    var clickedItem = event.args.item;
    if(clickedItem == 0){
      $("#playlists > button").hide();
    } else if(clickedItem == 1) {
      $("#playlists > button").show();
    }
  });
  // tab adiciona playlist
  $('#nova-playlist').jqxTabs({ width: 640});
  // docking
  $("#docking").jqxDocking({ width: 360, theme: 'classic' });
  $('#docking').jqxDocking('disableWindowResize', 'window1');
  // $('#docking').jqxDocking({ orientation: 'vertical', width: 300, mode: 'docked' });

  // rss
  $('#rss1').rssfeed('http://javascriptbrasil.com/feed',{}, function(e) {
    $(e).find('div.rssBody').vTicker();
  });

});