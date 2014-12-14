var PhotoMatrix = {
	itemList : [],
	backItemList : [],
	maxItemCount : 28,
	tag : 'prateek',
	accessToken : '',
	url : '',
	nextUrl : '',
	startPos : 0,

	clearItemList : function () {
		PhotoMatrix.itemList = [];
		PhotoMatrix.backItemList = [];
	},

	createUrl : function () {
		var str = 'https://api.instagram.com/v1/tags/' + PhotoMatrix.tag + '/media/recent?access_token=' + PhotoMatrix.accessToken + '&callback=createTagImageList';
		PhotoMatrix.setUrl(str);
	},

	setUrl : function (url) {
		PhotoMatrix.url = url;
	},

	getUrl : function () {
		return PhotoMatrix.url;
	},
	
	appendItemList : function (records) {
		// add items from data to itemList. max length of itemList should be max

		if(!records.data){
			return;
		}

		$.each(records.data, function(index, item){
			if(item.type === 'image'){
				if(PhotoMatrix.itemList.length < PhotoMatrix.maxItemCount){
					PhotoMatrix.itemList.push(item);
				}
				else{
					if(PhotoMatrix.backItemList.length < PhotoMatrix.maxItemCount){
						PhotoMatrix.backItemList.push(item);
					}
				}
			}
		});

		if(PhotoMatrix.itemList.length < PhotoMatrix.maxItemCount || PhotoMatrix.backItemList.length < PhotoMatrix.maxItemCount){
			PhotoMatrix.setUrl(records.pagination.next_url)
			PhotoMatrix.insertScriptTag();
		}
		else{
			if(PhotoMatrix.itemList.length === PhotoMatrix.maxItemCount){
				PhotoMatrix.createPhotoMatrix();
			}
		}
	},

	getMoreItems : function () {

	},

	createPhotoMatrix : function () {
		$(document).ready(function(){
			$(".live-tile").liveTile("destroy");
			$('.picture-item').remove();
			
			for(var i=PhotoMatrix.startPos; i < PhotoMatrix.maxItemCount; i++) {
				PhotoMatrix.createAndAppendItem(PhotoMatrix.itemList[i], PhotoMatrix.backItemList[i]);
			}

			if(PhotoMatrix.startPos > 0){
				for(var i=0; i<PhotoMatrix.startPos; i++){
					PhotoMatrix.createAndAppendItem(PhotoMatrix.itemList[i], PhotoMatrix.backItemList[i]);
				}
			}

			// setup the tile and then call goto on it the first time
			$('.live-tile').liveTile({
		    	animationComplete: function(tileData){        
		        	$(this).liveTile('goto', getRandomOptions());
		    	}
			}).liveTile('goto', getRandomOptions());

			// uncomment when ready to deploy
			setTimeout(function(){
				initialize();
			}, 30000);
		});
	},

	createAndAppendItem : function (frontItem, backItem) {
		// Start appending pics to the view
		var $container = $('<div>', {
			'class' : 'picture-item live-tile',
			'data-mode' : 'carousel',
			'data-start-now' : 'false',
			'data-repeat' : '0'
		});

		$container.append(
				$('<div>').append(
						$('<img>', {
							'src' : frontItem.images.thumbnail.url,
							'class' : 'full',
							'alt' : '3'
						})
					)
			).append(
				$('<div>').append(
						$('<img>', {
							'src' : backItem.images.thumbnail.url,
							'class' : 'full',
							'alt' : '4'
						})
					)
			);

		$container.appendTo($('.picture-container'));
	},

	reloadPhotomatrix : function () {

	},

	insertScriptTag : function () {
		var $script = $('<script>', {
			'type' : 'text/javascript',
			'src' : PhotoMatrix.getUrl()
		});

		$script.appendTo($('head'));
	}
};

function initialize(){
	if(window.location.hash){
		$(document).ready(function(){
			var i = Math.floor(Math.random() * 31);
			PhotoMatrix.startPos = i;
			$('.picture-container').show();
			$('.login-container').hide();
		});
		PhotoMatrix.clearItemList();
		var loc = '' + window.location.hash,
			pattern = /#access_token=(.*)/g,
			match = pattern.exec(loc);

		PhotoMatrix.accessToken = match[1];
		PhotoMatrix.createUrl();
		PhotoMatrix.insertScriptTag();
	}
}

function createTagImageList(data){
	console.log(data);
	PhotoMatrix.appendItemList(data);
}

function getRandomOptions(){
    // this could obviously be a lot more random
    var doIt = Math.floor(Math.random() * 1001) % 2 == 0;
    // set random options supported by the goto method
    // http://www.drewgreenwell.com/projects/metrojs#liveTileMethods
    return {
        index: "next",
        delay: 3000,
        animationDirection: doIt ? 'forward' : 'backward',
        direction: doIt ? 'vertical' : 'horizontal'
    };
}

initialize();