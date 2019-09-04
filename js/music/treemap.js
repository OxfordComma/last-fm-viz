import { 
  hierarchy, 
  cluster, 
  select,
	linkHorizontal
} from 'd3';

export const treemap = (selection, props) => {
  const {
    jsonData,
    deepestGenresByArtist,
    totalPlaysArtist,
    topArtists,
    width,
    height,
    colorScale,
    selectedLegendList,
    onClickArtist,
    onClickGenre
  } = props;

  console.log(deepestGenresByArtist)

  const topGenresTrimmed = topArtists.map(a => deepestGenresByArtist[a])
  var maxGenreDepth = 0;
  
  const treeLayout = cluster()
    .size([height, 0.7*width])
    .separation((a, b) => { 
      return (a.parent == b.parent ? 1 : 1); 
    })

  var root = hierarchy(jsonData); 

  root.descendants().forEach(d => {
    maxGenreDepth = d.depth > maxGenreDepth ? d.depth : maxGenreDepth;
  }) 

  root.sort((a,b) => {
    var aLen = a.children === undefined ? -1 : a.children.length;
    var bLen = b.children === undefined ? -1 : b.children.length;
    return(bLen - aLen);
  });
  // console.log(root)
  
  const tree = treeLayout(root);
  var links = tree.links();   
 
  const linkPathGenerator = linkHorizontal()
    .x(d => d.y)
    .y(d => d.x);

  const treeSpread = d3.max([width/7, 95]);
  selection.width = treeSpread * maxGenreDepth

  selection.selectAll('path').data(links)
    .enter().append('path')
      .attr('d', linkPathGenerator)

  const treeText = selection.selectAll('text').data(root.descendants());
  const treeTextEnter = treeText.enter().append('text')
    .attr('class', d => d.data.artist ? 'artist' : 'genre')
    .attr('x', d => d.y)
    .attr('y', d => d.x)
    .attr('dy', '0.32em')
    .attr('text-anchor', d => d.data.artist ? 'start' : 'start')
    .attr('fill', d => d.data.artist ? colorScale(d.data.id) : 'black')
    .text(d => d.data.id); 

  treeText.merge(treeTextEnter)
    .on('click', d => {
      var artists = d.leaves()
      return d.data.artist ? 
        artists.forEach(l => onClickArtist(l.data.id)) :
        onClickGenre(artists.map(l => l.data.id))
    })
    .transition(200)
      .attr('opacity', d => {
        const path = root.path(d).map(p => p.data.id)

        var childNames = d.descendants().map(c => c.data.id)
        return (
          selectedLegendList.length == 0 || 
          selectedLegendList.some(r=> childNames.indexOf(r) >= 0) 
          ? 1 : 0.2
        )})

};