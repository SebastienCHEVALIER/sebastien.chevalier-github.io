jQuery(document).ready(function( $ ) {

  $("#explorer").addClass('collapse');
  $("#infoBlockcypher").addClass('collapse');
  $("#infoChainSo").addClass('collapse');

  $('.popover-dismiss').popover({
  trigger: 'focus'
})

  $('[data-toggle="popover"]').popover()

  // Back to top button
  $(window).scroll(function() {
    if ($(this).scrollTop() > 100) {
      $('.back-to-top').fadeIn('slow');
    } else {
      $('.back-to-top').fadeOut('slow');
    }
  });
  $('.back-to-top').click(function(){
    $('html, body').animate({scrollTop : 0},1500, 'easeInOutExpo');
    return false;
  });

  // Initiate the wowjs animation library
  new WOW().init();

  // Initiate superfish on nav menu
  $('.nav-menu').superfish({
    animation: {
      opacity: 'show'
    },
    speed: 400
  });

  // Mobile Navigation
  if ($('#nav-menu-container').length) {
    var $mobile_nav = $('#nav-menu-container').clone().prop({
      id: 'mobile-nav'
    });
    $mobile_nav.find('> ul').attr({
      'class': '',
      'id': ''
    });
    $('body').append($mobile_nav);
    $('body').prepend('<button type="button" id="mobile-nav-toggle"><i class="fa fa-bars"></i></button>');
    $('body').append('<div id="mobile-body-overly"></div>');
    $('#mobile-nav').find('.menu-has-children').prepend('<i class="fa fa-chevron-down"></i>');

    $(document).on('click', '.menu-has-children i', function(e) {
      $(this).next().toggleClass('menu-item-active');
      $(this).nextAll('ul').eq(0).slideToggle();
      $(this).toggleClass("fa-chevron-up fa-chevron-down");
    });

    $(document).on('click', '#mobile-nav-toggle', function(e) {
      $('body').toggleClass('mobile-nav-active');
      $('#mobile-nav-toggle i').toggleClass('fa-times fa-bars');
      $('#mobile-body-overly').toggle();
    });

    $(document).click(function(e) {
      var container = $("#mobile-nav, #mobile-nav-toggle");
      if (!container.is(e.target) && container.has(e.target).length === 0) {
        if ($('body').hasClass('mobile-nav-active')) {
          $('body').removeClass('mobile-nav-active');
          $('#mobile-nav-toggle i').toggleClass('fa-times fa-bars');
          $('#mobile-body-overly').fadeOut();
        }
      }
    });
  } else if ($("#mobile-nav, #mobile-nav-toggle").length) {
    $("#mobile-nav, #mobile-nav-toggle").hide();
  }

  // Smooth scroll for the menu and links with .scrollto classes
  $('.nav-menu a, #mobile-nav a, .scrollto').on('click', function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      if (target.length) {
        var top_space = 0;

        if ($('#header').length) {
          top_space = $('#header').outerHeight();

          if( ! $('#header').hasClass('header-fixed') ) {
            top_space = top_space - 20;
          }
        }

        $('html, body').animate({
          scrollTop: target.offset().top - top_space
        }, 1500, 'easeInOutExpo');

        if ($(this).parents('.nav-menu').length) {
          $('.nav-menu .menu-active').removeClass('menu-active');
          $(this).closest('li').addClass('menu-active');
        }

        if ($('body').hasClass('mobile-nav-active')) {
          $('body').removeClass('mobile-nav-active');
          $('#mobile-nav-toggle i').toggleClass('fa-times fa-bars');
          $('#mobile-body-overly').fadeOut();
        }
        return false;
      }
    }
  });

  // Header scroll class
  $(window).scroll(function() {
    if ($(this).scrollTop() > 100) {
      $('#header').addClass('header-scrolled');
    } else {
      $('#header').removeClass('header-scrolled');
    }
  });

  // Porfolio isotope and filter

  $('#explorer-flters li').on( 'click', function() {
    $("#explorer-flters li").removeClass('filter-active');
    $(this).addClass('filter-active');
  });

});

///// Get & Display blockchain data /////

  var blockchain;
  var WSurl;
  var isValidAddress = function(hash,blockchain){
  if (blockchain=='bitcoin' || blockchain=='dash' || blockchain=='litecoin'){
    return (/^[0-9a-zA-Z]{34}$/.test(hash))
    }
  if (blockchain=='ethereum'){
    return (/^[0-9a-zA-Z]{40}$/.test(hash))
    }
  }
  var isValidBlocHash = function(hash,blockchain){
  if (blockchain=='bitcoin' || blockchain=='dash'){
    return (/^0000[0-9a-zA-Z]{60}$/.test(hash))
    }
  if (blockchain=='ethereum' || blockchain=='litecoin'){
    return (/^[0-9a-zA-Z]{64}$/.test(hash));
    }
  }
  var isValidTx = function(hash,blockchain){
    return (/^[0-9a-zA-Z]{64}$/.test(hash))
  }
  function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      var cls = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
        } else {
          cls = 'string';
          if (isValidAddress(match.replace('"','').replace('"',''),blockchain)){
            return `<a href="javascript:getAdress('${match.replace('"','').replace('"','')}')" class="${cls}">${match.replace('"','').replace('"','')}</a>`;
          }
          if (isValidBlocHash(match.replace('"','').replace('"',''),blockchain)){
            return `<a href="javascript:getBloc('${match.replace('"','').replace('"','')}')" class="${cls}">${match.replace('"','').replace('"','')}</a>`;
          }
          if (isValidTx(match.replace('"','').replace('"',''),blockchain)){
            return `<a href="javascript:getTx('${match.replace('"','').replace('"','')}')" class="${cls}">${match.replace('"','').replace('"','')}</a>`;
          }
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    });
  }

  function syntaxHighlightTx(json){
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    return `<a href="javascript:getTx('${match.replace('"','').replace('"','')}')" class="string">${match.replace('"','').replace('"','')}</a>`
  });
  }
  var getBloc = function (hash){
    document.getElementById("tabBloc").click()
    $("#bloc .data").show()
    if (blockchain=="litecoin"){
      getData("/block/LTC/"+hash,'block-result',displayBlocChainSo)
    }
    else{
      getData("/blocks/"+hash,'block-result',displayBlocBlockcypher)
    }
  }
  var getAdress = function (hash){
    document.getElementById("tabAdress").click()
    $("#adress .data").show()
    if (blockchain=="litecoin"){
      getData("/address/LTC/"+hash,'adress-result',displayAdresseChainSo)
    }
    else{
      getData("/addrs/"+hash,'adress-result',displayAdresseBlockcypher)
    }

  }
  var getTx = function (hash){
    document.getElementById("tabTx").click()
    $("#tx .data").show()
    if (blockchain=="litecoin"){
      getData("/tx/LTC/"+hash,'trans-result',displayTxChainSo)

    }
    else{
      getData("/txs/"+hash,'trans-result',displayTxBlockcypher)
    }
  }
  var getData = function(option,elementid,callback){
    fetch(WSurl+option)
      .then(res => res.json())
      .then(json => {
         callback(json)
      })
  }

  const displayInfoBlockcypher = (json) =>{
    $("#infoChainSo").removeClass('show');
    $("#infoBlockcypher").addClass('show');
    document.getElementById('time').innerHTML = new Date(json.time);
    document.getElementById('height').innerHTML = json.height;
    document.getElementById('hash').innerHTML = syntaxHighlight(JSON.stringify(json.hash,null,2));
    document.getElementById('lastBlock').innerHTML =  syntaxHighlight(JSON.stringify(json.previous_hash,null,2));
    if(blockchain ==='ethereum'){
      document.getElementById('maxfees').innerHTML =  json.high_gas_price;
      document.getElementById('medfees').innerHTML =  json.medium_gas_price;
      document.getElementById('minfees').innerHTML =  json.low_gas_price;
    }
    else{
      document.getElementById('maxfees').innerHTML =  json.high_fee_per_kb;
      document.getElementById('medfees').innerHTML =  json.medium_fee_per_kb;
      document.getElementById('minfees').innerHTML =  json.low_fee_per_kb;
    }
    document.getElementById('unconfirmed1').innerHTML =  json.unconfirmed_count;
    document.getElementById('lastFork').innerHTML =  json.last_fork_height;
    document.getElementById('hashLastFork').innerHTML =  syntaxHighlight(JSON.stringify(json.last_fork_hash,null,2));
    document.getElementById('info-rawData').innerHTML=syntaxHighlight(JSON.stringify(json,null,2));

  }

  const displayInfoChainSo = (json) => {
    $("#infoChainSo").addClass('show');
    $("#infoBlockcypher").removeClass('show');
    document.getElementById('height').innerHTML = json.data.blocks;
    document.getElementById('price').innerHTML = json.data.price + " BTC";
    document.getElementById('unconfirmed2').innerHTML =  json.data.unconfirmed_txs;
    document.getElementById('difficulty').innerHTML = json.data.mining_difficulty;
    document.getElementById('info-rawData').innerHTML=syntaxHighlight(JSON.stringify(json,null,2));
  }

  const displayBlocBlockcypher = (json) =>{
    document.getElementById('bloc-hash').innerHTML = syntaxHighlight(JSON.stringify(json.hash,null,2));
    document.getElementById('bloc-size').innerHTML = json.size;
    document.getElementById('bloc-height').innerHTML = json.height;
    $('#depth').show();
    document.getElementById('bloc-depth').innerHTML = json.depth;
    document.getElementById('bloc-total').innerHTML = json.total;
    document.getElementById('bloc-fees').innerHTML = json.fees;
    document.getElementById('bloc-merkle').innerHTML = json.mrkl_root;
    document.getElementById('bloc-nonce').innerHTML = json.nonce;
    document.getElementById('bloc-ntx').innerHTML = json.n_tx;
    document.getElementById('bloc-time').innerHTML = new Date(json.time);
    document.getElementById('bloc-last').innerHTML = syntaxHighlight(JSON.stringify(json.prev_block,null,2));
    document.getElementById('bloc-txs').innerHTML = syntaxHighlightTx(JSON.stringify(json.txids,null,2)).replace(/,/g , "").replace('[','').replace(']','')+'...';
    document.getElementById('bloc-rawData').innerHTML=syntaxHighlight(JSON.stringify(json,null,2));
  }

  const displayBlocChainSo = (json) =>{
    document.getElementById('bloc-hash').innerHTML = syntaxHighlight(JSON.stringify(json.data.blockhash,null,2));
    document.getElementById('bloc-size').innerHTML = json.data.size;
    document.getElementById('bloc-height').innerHTML = json.data.block_no;
    $('#depth').hide();
    document.getElementById('bloc-total').innerHTML = json.data.sent_value;
    document.getElementById('bloc-fees').innerHTML = json.data.fee;
    document.getElementById('bloc-merkle').innerHTML = json.data.merkleroot;
    document.getElementById('bloc-nonce').innerHTML = json.data.nonce;
    document.getElementById('bloc-ntx').innerHTML = json.data.txs.length;
    document.getElementById('bloc-time').innerHTML = new Date(json.data.time);
    document.getElementById('bloc-last').innerHTML = syntaxHighlight(JSON.stringify(json.data.previous_blockhash,null,2));
    document.getElementById('bloc-txs').innerHTML = syntaxHighlightTx(JSON.stringify(json.data.txs.map(tx => tx.txid),null,2)).replace('[','').replace(']','');
    document.getElementById('bloc-rawData').innerHTML=syntaxHighlight(JSON.stringify(json,null,2));
  }

  const displayAdresseBlockcypher = (json) =>{
    document.getElementById('adress-hash').innerHTML = syntaxHighlight(JSON.stringify(json.address,null,2));
    document.getElementById('adress-totalRecu').innerHTML = json.total_received;
    document.getElementById('adress-totalSent').innerHTML = json.total_sent;
    document.getElementById('adress-balance').innerHTML = json.final_balance;
    document.getElementById('adress-ntx').innerHTML = json.n_tx;
    document.getElementById('adress-txs').innerHTML = syntaxHighlightTx(JSON.stringify(json.txrefs.map(tx=> tx.tx_hash),null,2)).replace(/,/g , "").replace('[','').replace(']','');
    document.getElementById('adress-rawData').innerHTML=syntaxHighlight(JSON.stringify(json,null,2));
    $('#totalSent').show()
  }

  const displayAdresseChainSo = (json) =>{
    json=json.data;
    document.getElementById('adress-hash').innerHTML = syntaxHighlight(JSON.stringify(json.address,null,2));
    document.getElementById('adress-totalRecu').innerHTML = json.received_value;
    $('#totalSent').hide()
    document.getElementById('adress-balance').innerHTML = json.balance;
    document.getElementById('adress-ntx').innerHTML = json.total_txs;
    document.getElementById('adress-txs').innerHTML = syntaxHighlightTx(JSON.stringify(json.txs.map(tx=> tx.txid),null,2)).replace(/,/g , "").replace('[','').replace(']','');
    document.getElementById('adress-rawData').innerHTML=syntaxHighlight(JSON.stringify(json,null,2));
  }

  const displayTxBlockcypher = (json) =>{
    document.getElementById('tx-hash').innerHTML = syntaxHighlightTx(JSON.stringify(json.hash,null,2));
    document.getElementById('tx-size').innerHTML = json.size;
    document.getElementById('tx-blocHeight').innerHTML = json.block_height;
    document.getElementById('tx-addresses').innerHTML = syntaxHighlight(JSON.stringify(json.addresses,null,2)).replace(/,/g , "").replace('[','').replace(']','');
    document.getElementById('tx-total').innerHTML = json.total;
    document.getElementById('tx-fees').innerHTML = json.fees;
    document.getElementById('tx-time').innerHTML = new Date(json.confirmed);
    document.getElementById('tx-blocHash').innerHTML = syntaxHighlight(JSON.stringify(json.block_hash,null,2));
    var inputs;
    var outputs;
    if (blockchain !== 'ethereum'){
      inputs = json.inputs.map(input=>{
        return (`<table class="table table-hover table-responsive"><tbody><thead class="thead-dark"><th>Input n°${json.inputs.indexOf(input)+1}</th><th></th></thead><tr><td scope="row">Reçue de</td><td>${syntaxHighlightTx(JSON.stringify(input.prev_hash),null,2)}</td></tr><tr><td scope="row">Valeur</td><td>${input.output_value}</td></tr><tr><td scope="row">Script</td><td>${input.script}</td></tr><tr><td scope="row">Adresses</td><td>${syntaxHighlight(JSON.stringify(input.addresses,null,2)).replace(/,/g , "").replace('[','').replace(']','')}</td></tr><tr><td scope="row">Type de Script</td><td>${input.script_type}</td></tr></tbody></table>`)
      });
      outputs=json.outputs.map(output=>{
        var table = `<table class="table table-hover table-responsive"><tbody><thead class="thead-dark"><th>Output n°${json.outputs.indexOf(output)+1}</th><th></th></thead>`
        if (output.spent_by){
          table+=`<tr><td scope="row">Dépensée par</td><td>${syntaxHighlightTx(JSON.stringify(output.spent_by,null,2))}</td></tr>`
        }
        table+=`<tr><td scope="row">Valeur</td><td>${output.value}</td></tr><tr><td scope="row">Script</td><td>${output.script}</td></tr><tr><td scope="row">Adresses</td><td>${syntaxHighlight(JSON.stringify(output.addresses,null,2)).replace(/,/g , "").replace('[','').replace(']','')}</td></tr><tr><td scope="row">Type de Script</td><td>${output.script_type}</td></tr></tbody></table>`
        return table;
      });
    }
    if (blockchain === 'ethereum'){
        inputs = json.inputs.map(input=>{
          return (`<table class="table table-hover table-responsive"><tbody><thead class="thead-dark"><th>Input n°${json.inputs.indexOf(input)+1}</th><th></th></thead><tr><td scope="row">Sequence</td><td>${input.sequence}</td></tr><tr><td scope="row">Adresses</td><td>${syntaxHighlight(JSON.stringify(input.addresses,null,2)).replace(/,/g , "").replace('[','').replace(']','')}</td></tr></tbody></table>`)
        });
        outputs=json.outputs.map(output=>{
          return (`<table class="table table-hover table-responsive"><tbody><thead class="thead-dark"><th>Input n°${json.outputs.indexOf(output)+1}</th><th></th></thead><tr><td scope="row">Valeur</td><td>${output.value}</td></tr><tr><td scope="row">Adresses</td><td>${syntaxHighlight(JSON.stringify(output.addresses,null,2)).replace(/,/g , "").replace('[','').replace(']','')}</td></tr></tbody></table>`)
        });
      }
    document.getElementById('tx-input').innerHTML = inputs;
    document.getElementById('tx-output').innerHTML =outputs;
    $('#dblSpend').show();
    $('#size').show();
    $('#adresses').show();
    document.getElementById('tx-dblSpend').innerHTML=json.double_spend;
    document.getElementById('tx-rawData').innerHTML=syntaxHighlight(JSON.stringify(json,null,2));
  }

  const displayTxChainSo = (json) =>{
    json =json.data;
    document.getElementById('tx-hash').innerHTML = syntaxHighlightTx(JSON.stringify(json.txid,null,2));
    document.getElementById('tx-blocHeight').innerHTML = json.block_no;
    document.getElementById('tx-total').innerHTML = json.sent_value;
    document.getElementById('tx-fees').innerHTML = json.fee;
    document.getElementById('tx-time').innerHTML = new Date(json.time);
    document.getElementById('tx-blocHash').innerHTML = syntaxHighlight(JSON.stringify(json.blockhash,null,2));
    var inputs;
    var outputs;
      inputs = json.inputs.map(input=>{
        var table =`<table class="table table-hover table-responsive"><tbody><thead class="thead-dark"><th>Input n°${json.inputs.indexOf(input)+1}</th><th></th></thead>`
        if (input.received_from){
          table+=`<tr><td scope="row">Reçue de</td><td>${syntaxHighlightTx(JSON.stringify(input.received_from.txid),null,2)}</td></tr>`
        }
        table+=`<tr><td scope="row">Valeur</td><td>${input.value}</td></tr><tr><td scope="row">Script</td><td>${input.script_hex}</td></tr><tr><td scope="row">Adresses</td><td>${syntaxHighlight(JSON.stringify(input.address,null,2))}</td></tr></tbody></table>`
        return table;
      });
      outputs=json.outputs.map(output=>{
        var table = `<table class="table table-hover table-responsive"><tbody><thead class="thead-dark"><th>Output n°${json.outputs.indexOf(output)+1}</th><th></th></thead>`
        if (output.spent){
          table+=`<tr><td scope="row">Dépensée par</td><td>${syntaxHighlightTx(JSON.stringify(output.spent.txid,null,2))}</td></tr>`
        }
        table+=`<tr><td scope="row">Valeur</td><td>${output.value}</td></tr><tr><td scope="row">Script</td><td>${output.script_hex}</td></tr><tr><td scope="row">Adresses</td><td>${syntaxHighlight(JSON.stringify(output.address,null,2))}</td></tr><tr><td scope="row">Type de Script</td><td>${output.type}</td></tr></tbody></table>`
        return table;
      });
    document.getElementById('tx-input').innerHTML = inputs;
    document.getElementById('tx-output').innerHTML =outputs;
    $('#dblSpend').hide();
    $('#size').hide();
    $('#adresses').hide();
    document.getElementById('tx-rawData').innerHTML=syntaxHighlight(JSON.stringify(json,null,2));
  }



  var updtAdress = function(){
    var adress = document.getElementById('txt-adress').value;
    var isAddress = isValidAddress(adress,blockchain);
    if (isAddress){
      getAdress(adress)
    }
    else {
      alert("Entrée invalide")
    }
  }
  var updtTrans = function(){
    var transaction = document.getElementById('txt-trans').value;
    var isKey =isValidTx(transaction,blockchain);
    if (isKey){
      getTx(transaction);
    }
    else {
      alert("Entrée invalide")
    }
  }
  var updtBlock = function(){
    var bloc = document.getElementById('txt-block').value;
    var isKey = isValidBlocHash(bloc,blockchain);
    var isId = /[0-9]/.test(bloc);
    if (isKey || isId){
      getBloc(bloc)
    }
    else {
      alert("Entrée invalide")
    }
  }

  var updtBlockchain = function(selectedBlockchain){
    if (selectedBlockchain=="bitcoin"){
      WSurl = "https://api.blockcypher.com/v1/btc/main";
      blockchain ="bitcoin";
      document.getElementById('explorer-title').innerHTML='<img src="img/BTC-alt.svg"> Bitcoin';
    }
    if (selectedBlockchain=="ethereum"){
      WSurl = "https://api.blockcypher.com/v1/eth/main";
      blockchain = "ethereum";
      document.getElementById('explorer-title').innerHTML='<img src="img/ETH-alt.svg"> Ethereum';
    }
    if (selectedBlockchain=="dash"){
      WSurl = "https://api.blockcypher.com/v1/dash/main";
      blockchain = "dash";
      document.getElementById('explorer-title').innerHTML='<img src="img/DASH-alt.svg"> Dash';
    }

    if( selectedBlockchain=="litecoin"){
      WSurl = "https://chain.so/api/v2";
      blockchain ="litecoin";
      document.getElementById('explorer-title').innerHTML='<img src="img/LTC-alt.svg"> Litecoin';
    }
    if(blockchain != 'litecoin'){
      getData('','main',displayInfoBlockcypher);
    }
    else {
      getData('/get_info/LTC','main',displayInfoChainSo)
    }
    $("#explorer .rawData").innerHTML="";
    $("#explorer .data").hide();
    document.getElementById("tabMain").click()
    $("#explorer").addClass('show');
  }

const setTab = function(tabId) {
  $("#explorer-flters li").removeClass('filter-active');
  $(this).addClass('filter-active');
  $("#explorer .explorer-data").hide();
  $(tabId).show();
};
