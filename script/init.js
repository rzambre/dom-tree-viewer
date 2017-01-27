var svgWidth = $(document).width() > $(document).height() ?  $(document).height()*0.7 : $(document).width()*0.8;;
var svgHeight = svgWidth;
var allTrees = [];
var leafCoordinates;
var rootTree;

//Draw tree when input detected.
$('input#url').on('keydown',function(e){ // when a key is pressed down here
	var query = $(this).val(); // extracting the url entered in the text box
	if(e.keyCode === 13){ // if the key pressed down is the enter key
		d3.selectAll('svg').remove(); // clear the canvas
		$('div#main').append('<div id="loading">Loading...</div>') 

		$.post('/api/url',{query:query},function(data){ // what is api/url?
			parsedDOM = $.parseHTML(data);	// this is where we are getting access to the dom.
			rootTree = Tree(svgWidth/2, svgHeight, svgWidth/200, 'black');
			rootTree.angle = 0;       
			allTrees = [];
			allTrees.push(rootTree);
			$('div#loading').remove()

			//Iterates first level of DOM nodes, calling scrape() on all of those nodes' children.
			for (var i = 0 ; i < parsedDOM.length; i++){ // this loop is the driver loop that starts off a recursion of traversals
				scrape(parsedDOM[i], rootTree); 
				rootTree.isLeaf = false;
			}

			assignLeaves(); // this is where painting starts
			drawTree( allTrees, leafCoordinates); // also painting
			addListeners(); // event listeners to change the color scheme of the canvas
		});
	}
})
	/**
	 * Recursively traverses the DOM by calling itself on each child.
	 * Also recursively creates Tree elements by holding context of newly created trees and insert()ing children.
	 * @param  {[type]} domNode []
	 * @param  {[type]} ctx     [most recently created object of class Tree]
	 * @return {[type]}         [description]
	 */
var scrape = function(domNode,ctx){
	allTrees.push(ctx.insert());
	var childContext = ctx.children[ctx.children.length-1];
	if (domNode.childNodes.length > 0){
		childContext.isLeaf = false;
		for (var i = 0 ; i < domNode.childNodes.length; i++){
			scrape(domNode.childNodes[i], childContext); // recursion happening here
		}
	}
}
	/**
	 * Assigns coordinates to end branches by checking the "isLeaf" property.
	 * @return {[type]} [description]
	 */
var assignLeaves = function(){
	leafCoordinates = [];
	_.each(allTrees,function(tree,index){
		if(tree.isLeaf){
			leafCoordinates.push(tree.nextRoot())
		}
	})	
}
	/**
	 * Draws tree in svg based on input arrays.
	 * @param  {[type]} allTrees        [description]
	 * @param  {[type]} leafCoordinates [description]
	 * @return {[type]}                 [description]
	 */
var drawTree = function(allTrees, leafCoordinates){
	//Uses function in data to save a color object.
	var color = getRandomColor();
	$('input#size').val(svgWidth)

	//Adding svg canvas.
	var svg = d3.select('div#main').append('svg')
							.attr('class','tree')
							.attr('width',svgWidth)
							.attr('height',svgHeight)
							.style('background',color.bgColor);
	//Drawing branches.
	svg.selectAll('rect').data(allTrees)
		.enter().append('rect')
			.attr('x',svgWidth/2)
			.attr('y',svgHeight)
			.attr('height',0)
		.transition().duration(5000)
			.attr('x',function(d){return d.root.x - d.width/2})
			.attr('y',function(d){return d.root.y-d.height})
			.attr('height',function(d){return d.height})
			.attr('width',function(d){return d.width})
			.attr('fill', function(d){return d.color})
			.attr('transform',function(d){return 'rotate(' + d.angle + ' ' + d.root.x + ' ' + d.root.y + ')'});
	//Drawing leaves.
	svg.selectAll('circle').data(leafCoordinates)
		.enter().append('circle')
		.attr('r',0)
	.transition().duration(5000).delay(5000)
		.attr('cx',function(d){return d.x})
		.attr('cy',function(d){return d.y})
		.attr('r',function(d){return findRandom(svgWidth/200,svgWidth/1000);})
		.attr('fill',color.leafColor);	
}
