import React from 'react'
import ReactDOM from 'react-dom'
import ErrorBoundary from './ErrorBoundary.js'
import * as d3 from 'd3'
// import StackedAreaLegend from './StackedAreaLegend.js'

class ArtistTree extends React.Component {
	constructor(props) {
		super(props);

    // Date.prototype.getWeek = function() {
    //     var onejan = new Date(this.getFullYear(), 0, 1);
    //     var weekNum = Math.ceil((((this - onejan) / 86400000) + onejan.getDay()+1)/7);
    //     return weekNum > 52 ? 52 : weekNum
    // }

		this.state = {
      jsonData: [],
      nestData: [],
      seriesData: [],

      legendBy: d => d['artists'][0],
      nestBy: d => new Date(d.listen_date).getWeek().toString(),

      // legendLimit: 5,
      // username: document.getElementById('username').getAttribute("username").toString(),
      // username: 'philosphicus'
      // year: 2020
    }
	}

	componentDidMount() {
		var dataUrl = "/data/spotify/recent"
		d3.json(dataUrl, (err, data) => {
      console.log(data)

      // // Counts for each category
      // var counts = d3.nest()
      //   .key(this.state.legendBy)
      //   .rollup(v => v.length)
      //   .entries(data)
      //   .sort((a, b) => b.value - a.value)

      // console.log(counts)

      // var legendItems = counts.slice(0, this.state.legendLimit).map(i => i.key)
      // data = data
      //   .map(d => { d.selected = true; return d })
      //   .filter(d => legendItems.includes(this.state.legendBy(d)))
      // console.log(data)

      // // Data by week
      // var obj = {}
      // legendItems.forEach(l => obj[l] = 0)
      // // console.log(obj)     
      
      // // dataByWeek
      // // needs to be .object in order to stack properly
      // var nest = d3.nest()
      //   .key(this.state.nestBy)
      //   .key(this.state.legendBy)
      //   .rollup(v => {
      //       // console.log(v)
      //       return v.length
      //   })
      //   .object(data)

      // console.log(nest)

      // // Reconfigure for stacking
      // var toStack = Object.keys(nest).map(k => {
      //   var toReturn = { key: k, ...nest[k] }
      //   console.log(toReturn)
      //   return toReturn
      // })

      // // Add in missing values for 0 
      // toStack.forEach(n => {
      //   legendItems.forEach(d => {
      //     if (!(d in n))
      //       n[d] = 0
      //   })
      // })
      // console.log(toStack)
  
      // var stack = d3.stack()
      //     .keys(legendItems)
      //     .offset(d3.stackOffsetWiggle)
      //     .order(d3.stackOrderInsideOut)
      // // console.log(stack)

      // var series = stack(toStack)

      // // dataToStack
      // series = series.map(d => { d.selected = true; return d })
      // console.log(series)

      this.setState({ jsonData: data })
      // this.setState({ nestData: nest })
      // this.setState({ seriesData: series });
      // this.setState({ legendItems: legendItems })
      // this.setState({ selectedLegendItems: legendItems })
      // console.log(this.state)
		})
	}

	render() {
    return null
		// return (
		// 	<div className="container">
		// 		<StackedAreaLegend
		// 			width={window.innerWidth}
		// 			height={window.innerHeight}
		// 			data={this.state.seriesData}
  //         year={this.state.year}
		// 			// seriesData={this.state.seriesData}
  //         legendBy={this.state.legendBy}
  //         nestBy={this.state.nestBy}
		// 			// legendItems={this.state.legendItems}
		// 			// selectedLegendItem={this.state.legendItems}
		// 			/>
		// 	</div>
		// )
	}
}

// Render application
ReactDOM.render(
	<ErrorBoundary>
		<ArtistTree/>
	</ErrorBoundary>,
	document.getElementById('root')
);

// import {
//   select,
//   // json,
//   // cluster,
//   hierarchy,
//   // linkHorizontal,
//   // zoom,
//   // event,
//   // scaleSequential,
//   scaleOrdinal,
//   // max,
//   // interpolateRdBu,
//   // interpolatePlasma,
//   // schemeCategory10,
//   interpolateRainbow
// } from 'd3';

// import { loadTreeData } from './loadTreeData';
// import { loadStackedArtistData } from './loadStackedArtistData'
// import { treemap } from './treemap';
// import { stackedAreaVertical } from './stackedAreaVertical';
// // import { colorLegend } from './colorLegend';

// var treeData,
// artistData, byWeekPlaysGenre, 
// byWeekPlaysArtist
// , totalPlaysByArtist;
// var artistColorScale
// // , genreColorScale;
// var topArtists, topArtistsTrimmed
// , topGenres;
// var playScale;
// var selectedArtists = []; 
// var selectedGenre;
// var deepestGenresByArtist;
// var byWeekPlays;

// var verticalAreaG, 
// // artistLegendG, 
// treeG;
// var treeWidth, treeHeight, areaWidth, areaHeight;

// const numArtists = 100;
// const year = 2019

// loadTreeData(
//   '/data/music/tracks/'+year.toString(),
//   '/data/music/artists/'+year.toString()).then(data => {
//   treeData = data.treeData;
//   console.log(treeData)
//   // artistData = data.artistData;
//   // byWeekPlaysGenre = data.byWeekPlaysGenre;
//   byWeekPlaysArtist = data.byWeekPlaysArtist;
//   // topGenres = data.topGenres;
//   topArtists = data.topArtists;
//   deepestGenresByArtist = data.deepestGenresByArtist;
//   // totalPlaysByArtist = data.totalPlaysByArtist;


//   treeWidth = document.getElementById('tree').clientWidth < 500 ? 1000 : document.getElementById('tree').clientWidth
//   treeHeight = numArtists * 15;
  
//   areaWidth = document.getElementById('stacked-area-artist-vertical').clientWidth;
//   areaHeight = treeHeight;  

//   const verticalAreaSvg = select('.stacked-area-artist-svg')
//       .attr('height', areaHeight)
//       .attr('width', areaWidth)

//   // verticalAreaSvg.append('rect')
//   //     .attr('width', '100%')
//   //     .attr('height', '100%')
//   //     .attr('fill', 'black')

//   const treeSvg = select('.tree')
//     .attr('height', treeHeight)
//     .attr('width', treeWidth)

//   // treeSvg.append('rect')
//   //     .attr('width', '100%')
//   //     .attr('height', '100%')
//   //     .attr('fill', 'black')

//   verticalAreaG = verticalAreaSvg.append('g')
//     // .attr('class', 'd-none d-md-block')
//     .attr('transform', `translate(${0}, ${0}), rotate(90)`);

//   // artistLegendG = verticalAreaSvg.append('g')
//   //   .attr('class', 'legend')
//   //   .attr('transform', `translate(${5},${5})`)

//   treeG = treeSvg.append('g')
//     .attr('class', 'tree')


//   topArtistsTrimmed = topArtists.slice(0, numArtists);
//   console.log(topArtistsTrimmed)
//   // const topGenresTrimmed = topArtistsTrimmed.map(a => deepestGenresByArtist[a])
//   addArtistsToTree(topArtistsTrimmed, treeData);
//   removeEmptyLeaves(treeData)
  
//   topArtistsTrimmed = hierarchy(treeData).leaves().map(d=>d.data.id);


//   artistColorScale = scaleOrdinal()
//     .domain(topArtistsTrimmed);

//   const n = artistColorScale.domain().length;
  
//   artistColorScale
//     .range(artistColorScale.domain().map((d, i) => interpolateRainbow(i/(n+1))));

//   // genreColorScale = scaleOrdinal()
//   //   .domain(topGenres)
//   //   .range(schemeCategory10);

//   // playScale = scaleSequential(interpolatePlasma)
//   //   .domain([0, max(Object.values(totalPlaysByArtist)) + 100]);

//   render();
// })

// const onClickGenre = d => {
//   selectedArtists = selectedArtists.sort().join(',') === d.sort().join(',') ? [] : d;
//   console.log(selectedArtists)
//   render(); 
// };

// const onClickArtist = d => {

//   if (!selectedArtists.includes(d))
//     selectedArtists.push(d);
//   else
//   selectedArtists = selectedArtists.filter(val => val != d);
//   console.log(selectedArtists)
//   render(); 
// };

// const addArtistsToTree = function(artists, t) {
//     artists.forEach(a => (deepestGenresByArtist[a] == t.id ? t.children.push({id: a, artist: true, children: []}) : 1))
//     if (t.children)
//       t.children.forEach(c => addArtistsToTree(artists, c))
//   }

// const removeEmptyLeaves = function(t) {
//     if (t.children.length > 0)
//     {
//       var toRemove = []
//       t.children.forEach(c => {
//         removeEmptyLeaves(c)

//         if (!c.artist && c.children.length == 0)
//           toRemove.push(c.id)
//       })
//       if (toRemove)
//         t.children = t.children.filter(c => !toRemove.includes(c.id))
//     }
//   }

// const render = () => {
//   treeG.call(treemap, {
//     treeData,
//     // deepestGenresByArtist,
//     // totalPlaysByArtist,
//     // topArtists,
//     width: treeWidth,
//     height: treeHeight,
//     colorScale: artistColorScale,
//     selectedLegendList: selectedArtists,
//     onClickArtist: onClickArtist,
//     onClickGenre: onClickGenre
//   });

//   verticalAreaG.call(stackedAreaVertical, {
//     dataToStack: byWeekPlaysArtist,
//     topArtists: topArtistsTrimmed,
//     colorScale: artistColorScale,
//     selectedLegendList: selectedArtists,
//     width: areaWidth,
//     height: areaHeight,
//     numArtists: numArtists,
//     onClick: onClickArtist,
//     year: 2019,
//     amplitude: 1,
//     position: 0,
//     stackOffset: d3.stackOffsetWiggle
//     // stackOrder:
//   });

//   // artistLegendG.call(colorLegend, {
//   //   colorScale: artistColorScale,
//   //   circleRadius: 5,
//   //   spacing: 15,
//   //   textOffset: 12,
//   //   backgroundRectWidth: 135,
//   //   onClick: onClickArtist,
//   //   selectedLegendList: selectedArtists,
//   //   numArtists: numArtists
//   // });
// }

// import { 
//   hierarchy, 
//   cluster, 
//   // select,
//   max,
//   linkHorizontal
// } from 'd3';

// export const treemap = (selection, props) => {
//   const {
//     treeData,
//     // deepestGenresByArtist,
//     // totalPlaysArtist,
//     // topArtists,
//     width,
//     height,
//     colorScale,
//     selectedLegendList,
//     onClickArtist,
//     onClickGenre
//   } = props;

//   // console.log(deepestGenresByArtist)

//   // const topGenresTrimmed = topArtists.map(a => deepestGenresByArtist[a])
//   var maxGenreDepth = 0;
  
//   const treeLayout = cluster()
//     .size([height, 0.7*width])
//     .separation((a, b) => { 
//       return (a.parent == b.parent ? 1 : 1); 
//     })

//   var root = hierarchy(treeData); 

//   root.descendants().forEach(d => {
//     maxGenreDepth = d.depth > maxGenreDepth ? d.depth : maxGenreDepth;
//   }) 

//   root.sort((a,b) => {
//     var aLen = a.children === undefined ? -1 : a.children.length;
//     var bLen = b.children === undefined ? -1 : b.children.length;
//     return(bLen - aLen);
//   });
//   // console.log(root)
  
//   const tree = treeLayout(root);
//   var links = tree.links();   
 
//   const linkPathGenerator = linkHorizontal()
//     .x(d => d.y)
//     .y(d => d.x);

//   const treeSpread = max([width/7, 95]);
//   selection.width = treeSpread * maxGenreDepth

//   selection.selectAll('path').data(links)
//     .enter().append('path')
//       .attr('d', linkPathGenerator)

//   const treeText = selection.selectAll('text').data(root.descendants());
//   const treeTextEnter = treeText.enter().append('text')
//     .attr('class', d => d.data.artist ? 'artist' : 'genre')
//     .attr('x', d => d.y)
//     .attr('y', d => d.x)
//     .attr('dy', '0.32em')
//     .attr('text-anchor', d => d.data.artist ? 'start' : 'start')
//     .attr('fill', d => d.data.artist ? colorScale(d.data.id) : 'black')
//     .text(d => d.data.id); 

//   treeText.merge(treeTextEnter)
//     .on('click', d => {
//       var artists = d.leaves()
//       return d.data.artist ? 
//         artists.forEach(l => onClickArtist(l.data.id)) :
//         onClickGenre(artists.map(l => l.data.id))
//     })
//     .transition(200)
//       .attr('opacity', d => {
//         // const path = root.path(d).map(p => p.data.id)

//         var childNames = d.descendants().map(c => c.data.id)
//         return (
//           selectedLegendList.length == 0 || 
//           selectedLegendList.some(r=> childNames.indexOf(r) >= 0) 
//           ? 1 : 0.2
//         )})

// };