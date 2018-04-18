var ebf = (function () {
  var globalData = {};
  var breweryId = -1;
  var beerId = -1;
  var toDrinkInit = false;
  var theFood = "";
  var theRest = "";
  var dugs = "";
  var music = "";

  return {
    init: function() {
      ebf.initData();
      ons.disableAutoStyling();
      //ons.platform.select('android'); // probably not necessary, but hey, why not.
      ons.forcePlatformStyling('android');

      window.fn = {};

      window.fn.open = function() {
        var menu = document.getElementById('menu');
        menu.open();
      };

      window.fn.load = function(page, data) {
        var content = document.getElementById('ebfNavigator');
        var menu = document.getElementById('menu');

        menu.close();
          if(page === "information.html") {
            setTimeout(function() {
              if($("#about").html() == "")
              {
                $("#about").html("<h2>"+globalData.information.about.title+"</h2>"+globalData.information.about.content);
                $("#travel").html("<h2>"+globalData.information.travel.title+"</h2>"+globalData.information.travel.content);
              };
            },350);
          }
          else if(page == "beer-list.html") {
            breweryId = data;
            //ebf.pushData("beer-list.html", breweryId);
          }
          else if(page == "beer-detail.html") {
            beerId = data;
            //ebf.initBeerDetail(breweryId, beerId);
          }

          content.bringPageTop(page, {animation: "slide"});

        };


      window.fn.pop = function() {
        var content = document.getElementById('ebfNavigator');
        content.popPage();
      };



      document.addEventListener('init', function(event) {


        var page = event.target;

        if(page.id === "beer") {
          if($("#brewery-list").html() != "")
          {
            $.each(globalData.beer.breweries, function(key, value) {
              $("#brewery-list").append(ebf.writeBrewery(key, value));
            });
          }
        }
        else if(page.id === "beer-list") {
          $("#ons-beer-list").html("");
          ebf.pushData("beer-list.html", breweryId);
        }
        else if(page.id === "beer-detail") {
          ebf.initBeerDetail(breweryId, beerId);
        }
        else if(page.id === "toDrink-list") {
          $("#ons-toDrink-list").html("");
          ebf.pushData("toDrink.html");
          ebf.bindRemove();
          toDrinkInit = true;
        }
        else if(page.id === "ons-dugs") {
          if($("#dugs").html() == "")
            $("#dugs").html(globalData.dugs_pub.content);

        }
        else if(page.id == "food")
        {
          if($("#food-detail-container").html() == "")
            ebf.initFood();
        }
        else if(page.id == "ons-rest")
        {
          if($("#rest").html() == "")
            ebf.initRest();
        }




      });





      ebf.setCountdown();
      ebf.map();
    },


    bindRemove: function() {
      $(".fa-times-circle").on("click", function(event) {
        event.stopPropagation();
        localStorage.removeItem("fav_"+$(this).data("id"));
        $("#beer_"+$(this).data("id")).remove();
        $("ons-list-header").each(function(i) {
          if(!$(this).next().hasClass("list-item")) {
            $(this).remove();
          }
        });
        if($("#ons-toDrink-list").html() == "")
        {
          $("#toDrink-placeholder").show();
          $("#ons-toDrink-list").hide();
        }
      });
    },

    initData: function() {
      $.ajax({
        dataType: "json",
        url: "data.js",
        success: function(data) {
          globalData = data;
        }
      });
    },
    load: function(page) {

    },
    pushData: function(page, data) {
      switch(page) {
        case "beer-list.html" :
          ebf.doPush("beer-list",eval("globalData.beer.breweries.brewery_"+data+".beer_list"));
          break;

        case "toDrink.html" :
          ebf.doPush("toDrink-list");
          break;
        }
    },
    doPush: function(page, data) {
      switch (page) {
        case "beer-list":
          $("#ons-beer-list").html("<ons-list-header modifier=\"purple\" id=\"beer-list-header\">"+data.items[0].brewery.brewery_name+"</ons-list-header>");
          $.each(data.items, function() {

            $("#ons-beer-list").append(ebf.writeBeer(this,false));
            var that = this;
            $("#"+this.beer.bid).rateYo({
              rating:   $("#"+that.beer.bid).data("rating"),
              starWidth:"18px",
              readOnly:true
             });
          });
          break;
        case "toDrink-list":
          var beers = [];
          var showList = false;
          $.each(localStorage, function(key, val) {
            if(key.substring(0,3) == "fav") {
              showList = true;
              var o = JSON.parse(val);
              var details = eval("globalData.beer.breweries.brewery_"+o.brewery_id);
              var beer = details.beer_list.items.find(function(element) {
                return element.beer.bid == o.bid;
              });
              beers.push(beer);

            }
          });
          if(showList)
          {
            $("#toDrink-placeholder").hide();
            $("#ons-toDrink-list").show();
          }
          else {
            $("#toDrink-placeholder").show();
            $("#ons-toDrink-list").hide();
          }


          beers = beers.sort(function(a, b) {
            return a.brewery.brewery_name > b.brewery.brewery_name
          });

          var brewery = "";
          $("#ons-toDrink-list").html("");
          $.each(beers, function() {
            if(brewery != this.brewery.brewery_id)
                $("#ons-toDrink-list").append("<ons-list-header modifier=\"purple\">"+this.brewery.brewery_name+"</ons-list-header>");
            $("#ons-toDrink-list").append(ebf.writeBeer(this,true));
            $("#"+this.beer.bid).rateYo({
              rating: $("#"+this.beer.bid).data("rating"),
              starWidth:"18px",
              readOnly:true
            });
            brewery = this.brewery.brewery_id;
          });
          ebf.bindRemove();

        break;


      }

    },
    writeBrewery: function(key, brewery) {
      var brewery_item ="<ons-list-item onclick=\"fn.load('beer-list.html'," +brewery.brewery_id+")\" tappable id=\"brewery_"+brewery.brewery_id+" \">";
      brewery_item+= "<div class=\"left\">";
      brewery_item+= "  <img class=\"list-item__thumbnail\" src=\""+brewery.brewery_label+"\">";
      brewery_item+= "</div>";
      brewery_item+= "<div class=\"center\">";
      brewery_item+= "  <span class=\"list-item__title\">"+brewery.brewery_name+"</span><span class=\"list-item__subtitle\">"+brewery.location.brewery_city+"</span>";
      brewery_item+= "</div>";
      brewery_item+= "</ons-list-item>";
      return brewery_item;
    },
    writeBeer: function(beer, toDrink) {
      var brewery_item ="<ons-list-item onclick=\"fn.load('beer-detail.html'," +beer.beer.bid+")\" tappable id=\"beer_"+beer.beer.bid+"\">";
      brewery_item+= "<div class=\"left\">";
      brewery_item+= "  <img class=\"list-item__thumbnail\" src=\""+beer.beer.beer_label+"\">";
      brewery_item+= "</div>";
      brewery_item+= "<div class=\"center\">";
      brewery_item+= "  <span class=\"list-item__title\">"+beer.beer.beer_name+" - "+beer.beer.beer_abv+"%</span>";
      brewery_item+= "   <span class=\"list-item__subtitle\">"+beer.beer.beer_style+"</span>";
      brewery_item+= "   <div class=\"rating-container\"><div class=\"rating\" id=\""+beer.beer.bid+"\" data-rating=\""+beer.beer.rating_score+"\"></div><div class=\"rating-score\">"+beer.beer.rating_score.toFixed(2)+"/5 ("+beer.beer.rating_count+" votes)</div></div>";
      brewery_item+= "</div>";
      if(toDrink) {
        brewery_item+= "<div class=\"right\">";
        brewery_item+= "<i id=\"remove_"+beer.beer.bid+"\" data-id=\""+beer.beer.bid+"\" class=\"fa fa-times-circle remove\"></i>";
        brewery_item+= "</div>";
      }
      brewery_item+= "</ons-list-item>";
      return brewery_item;
    },
    writeRating: function(rating) {

      var percent = Math.round(rating*20);

      var html = "<div class=\"star-rating\" title=\""+percent+"%\">";
      html += "  <div class=\"back-stars\">";
      html += "      <i class=\"fa fa-star\" aria-hidden=\"true\"></i>";
      html += "      <i class=\"fa fa-star\" aria-hidden=\"true\"></i>";
      html += "      <i class=\"fa fa-star\" aria-hidden=\"true\"></i>";
      html += "      <i class=\"fa fa-star\" aria-hidden=\"true\"></i>";
      html += "      <i class=\"fa fa-star\" aria-hidden=\"true\"></i>";

      html += "      <div class=\"front-stars\" style=\"width: "+percent+"%\">";
      html += "          <i class=\"fa fa-star\" aria-hidden=\"true\"></i>";
      html += "          <i class=\"fa fa-star\" aria-hidden=\"true\"></i>";
      html += "          <i class=\"fa fa-star\" aria-hidden=\"true\"></i>";
      html += "          <i class=\"fa fa-star\" aria-hidden=\"true\"></i>";
      html += "          <i class=\"fa fa-star\" aria-hidden=\"true\"></i>";
      html += "      </div>";
      html += "  </div>";
      html += "</div>";
      return html;
    },
    writeBeerDetail: function(beer) {
      var html = "<div style=\"display:flex\">";
      html += "<div><img src=\""+beer.beer.beer_label+"\" width=\"100\"/></div>";
      html += "<div style=\"margin-left:12px\" class=\"header-font\">";
      html += "<span class=\"beer-header\">"+beer.beer.beer_name+"</span><br />";
      html += "<span class=\"brewery-header\">"+beer.brewery.brewery_name+"</span><br />";
      html += "<span class=\"beer-subheader\">"+beer.beer.beer_style+"</span><br />";
      html += "<span class=\"beer-subheader\">"+beer.beer.beer_abv+"% ABV</span>";
      html += "<div class=\"rating-container beer-subheader\">Untappd: <div class=\"rating\" id=\"rating_"+beer.beer.bid+"\" data-rating=\""+beer.beer.rating_score+"\" style=\"margin-left:4px;margin-top:0 !important\"></div></div>"
      html += "</div></div></div></div>";
      html += "<ons-card>";
      html += "<div class=\"beer-detail-header\">About "+beer.beer.beer_name+"</div>";
      html += "<div class=\"content\">";
      html += beer.beer.beer_description;
      html += "<div style=\"display:flex;margin-top:10px\"><div style=\"margin-top:10px\"><strong>Rate It:</strong></div> <div style=\"flex: 0 auto\" id=\"user_"+beer.beer.bid+"\"></div><div style=\"flex-grow:1;vertical-align:middle;\"><i class=\"fa fa-heart"+(localStorage.getItem("fav_"+beer.beer.bid) == null ? "" : " red")+"\" style=\"float:right;font-size:25px;margin-top:6px\" /></div></div>";
      return html;
    },
    writeFoodDetail: function(food) {
      var html = "<ons-card>";
      html += "<div class=\"beer-detail-header\">"+food.title+"</div>";
      html += "<div class=\"content\"><img src=\"images/"+food.image+"\" width=\"37%\" style=\"float:left;padding:0 15px 0 0\"/>";
      html += food.description;
      html += "<br /><br /><div onclick=\"window.open('"+food.url+"','_system')\"><a href=\"#\" />"+food.url+"</a></div>";
      html += "</div>";
      html += "</ons-card>"

      return html;
    },
    writeRestDetail: function(item) {
      var html = "<ons-card>";
      html += "<div class=\"beer-detail-header\">"+item.title+"</div>";
      html += "<div class=\"content\"><img src=\"images/"+item.image+"\" width=\"37%\" style=\"float:left;padding:0 15px 0 0\"/>";
      html += item.description;
      html += "<br /><br /><div onclick=\"window.open('"+item.url+"','_system')\"><a href=\"#\" />"+item.url+"</a></div>";
      html += "</div>";
      html += "</ons-card>"

      return html;
    },
    initBeerDetail: function(breweryId, beerId) {
      var data = ebf.beerDetail(breweryId, beerId);
      $("#beer-detail-container").html(ebf.writeBeerDetail(data));

      $(".fa-heart").on("click", function() {
        if($(this).hasClass("red"))
        {
          $(this).removeClass("red");
          localStorage.removeItem("fav_"+bid);
        }
        else {
          $(this).addClass("red");

          var f = {bid:bid, brewery_id:breweryId}
          localStorage.setItem("fav_"+bid, JSON.stringify(f));

        }

      });

      $("#rating_"+data.beer.bid).rateYo({
        rating: $("#rating_"+data.beer.bid).data("rating"),
        starWidth:"18px",
        readOnly:true
       });


      var uRating = localStorage.getItem("rating_"+data.beer.bid);
       uRating = (uRating != null ? JSON.parse(uRating).rating : 0);


      var bid = data.beer.bid;
      $("#user_"+bid).rateYo({
        halfStar: true,
        rating: uRating
       })
      .on("rateyo.set", function (e, data) {
        var rating = data.rating;
        var o = {rating:rating, synced:false}
        if(localStorage.getItem("rating_"+bid) != "null")
        {
          localStorage.setItem("rating_"+bid, JSON.stringify(o));

          $.ajax({
            type: "POST",
            url: "http://www.sunburstlabs.com/ebf/index.php",
            crossDomain: true,
            data: {
              beer_id: bid,
              rating: rating
            },
            dataType:"json",
            success: function() {
              return true;
            }
          });
        }

      });
    }
    ,
    initFood: function() {
      if(theFood == "")
      {
        var data = globalData.food;
        $("#food-detail-container").html("");
        $.each(data.vendors, function() {
          theFood += ebf.writeFoodDetail(this);
        });
      }
      if($("#food-detail-container").html() == "")
        $("#food-detail-container").html(theFood);
    },
    initRest: function() {
      if(theRest == "")
      {
        var data = globalData.rest;
        $("#rest").html("");
        $.each(data.items, function() {
          theRest += ebf.writeRestDetail(this);
        });
      }
      if($("#rest").html() == "")
        $("#rest").html(theRest);
    },
    beerDetail: function(breweryID, beerID) {
      var beer = eval("globalData.beer.breweries.brewery_"+breweryID+".beer_list.items");
      var beerDetail = beer.find(function(element) {
        return element.beer.bid == beerID;
      });

      return beerDetail;
    },
    setCountdown: function() {
      // Set the date we're counting down to

      var countDownDate = new Date("Jun 2, 2018 12:00:00").getTime();

      // Update the count down every 1 second
      var x = setInterval(function() {

        // Get todays date and time
        var now = new Date().getTime();

        // Find the distance between now an the count down date
        var distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result in the element with id="demo"
        $("#days").html(days);
        $("#hours").html(hours);
        $("#minutes").html(minutes);
        $("#seconds").html(seconds);

        // If the count down is finished, write some text
        if (distance < 0) {
          clearInterval(x);
          $(".countdown").html("EXPIRED");
        }
      }, 1000);
    },
    map: function() {
      var x = setInterval(function() {
        if($("#sitemap").length != 0)
        {
          initMap();
          clearInterval(x);
        }
      });
    }
  }
})();
