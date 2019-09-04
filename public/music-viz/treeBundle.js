(function (d3$1) {
  'use strict';

  // import lastfmapi from 'lastfmapi';
  // import LastFM from 'last-fm';

  const loadTreeData = (tracksUrl, artistsUrl) => {
    // cnosole.log(lastfmapi)
    return Promise.all([
      d3$1.json(tracksUrl),
      d3$1.json(artistsUrl),
      d3$1.json('../music-viz/genreHierarchy.json'),
      // json('data/artists.json'), 
      // json('data/tracks.json')
      ]
    ).then(data => {
      console.log(data);
      // const csvData = data[0];
      var jsonData = data[2];
      const artistData = data[1];
      const trackData = data[0];
      const startDate = new Date('2019', '00', '01');
      const endDate = new Date('2020', '00', '01');

      // console.log(data)
      var sortedGenreList = [];
      var sortedArtistList = [];
      var sortedTrackList = [];
      var totalPlaysByArtist = {};
      var totalPlaysByGenre = {};
      var totalPlaysByTrack = {};
      var deepestGenresByArtist = {};
      
      var topGenres = [];
      var topArtists = [];
      var topTracks = [];
      var byWeekPlaysGenre = [];
      var byWeekPlaysArtist = [];
      var byWeekPlaysTrack = [];
      var weekDict = {};

      // Bad tags included in the data set. Removed anything country-specific or anything I considered 'not a genre'
      const genresToRemove = ['seenlive', 'femalevocalists', '', 'british', 'japanese', 'ofwgkta', 'irish', 'usa', 'australia', 
        'australian', 'under2000 listeners', '90s', '80s', '70s', '60s', 'all', 'philadelphia', 'scottish', 'sanremo', 'newzealand', 
        'twinkledaddies', 'sanremo2009', 'political', 'american', 'canadian', 'italian', 'psychadelic', 'instrumental', 'ambient', 
        'chillout', 'singersongwriter', 'acoustic'];

      var genreHierarchy = d3$1.hierarchy(jsonData); 
      genreHierarchy.data = jsonData; 

      genreHierarchy.sort((a,b) => {
        const aLen = a.children === undefined ? 0 : a.children.length;
        const bLen = b.children === undefined ? 0 : b.children.length;
        return(bLen - aLen); 
      });
          
      genreHierarchy.descendants().forEach(d => {
        const name = d.data.id;
        // byWeekPlaysGenre.push(name);
        totalPlaysByGenre[name] = { 
          depth: d.depth,
          plays: 0,
        };  
      });
          
      trackData.forEach(d => {
        d.listen_date = new Date(d.listen_date);
        if (d.listen_date < startDate || d.listen_date > endDate)
          return;
        // console.log(d)


        d.genre = artistData.filter(a => a.name == d.artist)[0].genres;
        // console.log(d.genre)
        if (d.genre === "")
          return;
        d.genre = d.genre
          // .replace(/[[\]]/g, '')
          // .split(',')
          .map(g => g.toLowerCase().replace(/\s|-/g, ''))
          .filter(g => !genresToRemove.includes(g));
        
        //If there's no genre we can't do much
        if (d.genre.length == 0)
          return;

        // Convert time since Jan 1, 2018 from msec to # of weeks
        // 1000 msec/sec, 60 sec/min, 60 min/hr, 24 hr/day, 7 days/week, +1 so it starts on week 1
        d.weekNum = (parseInt((d.listen_date - startDate)/1000/60/60/24/7 + 1));
        // console.log(d.weekNum)
        const maxGenre = d.genre[0];
        
        if (totalPlaysByArtist[d.artist] === undefined)
          totalPlaysByArtist[d.artist] = 1;
        else
          totalPlaysByArtist[d.artist] += 1;

        if (totalPlaysByTrack[d.track] === undefined)
          totalPlaysByTrack[d.track] = {artist: d.artist, track: d.track, plays: 1};
        else
          totalPlaysByTrack[d.track].plays += 1;
        
        //Add in the genres not in the tree but  give them negative depth so they are sorted last
        d.genre.forEach(g => {
          if (totalPlaysByGenre[g] === undefined)
            totalPlaysByGenre[g] = { depth: -1, plays: 1};
          else
            totalPlaysByGenre[g].plays += 1;
        });

        d.genre.sort((a, b) => totalPlaysByGenre[b].depth - totalPlaysByGenre[a].depth); 


        if (deepestGenresByArtist[d.artist] === undefined)
          deepestGenresByArtist[d.artist] = d.genre[0];
        
        if (weekDict[d.weekNum] === undefined)
          weekDict[d.weekNum] = {artists: {}, genres: {}, tracks: {}};
        
        if (weekDict[d.weekNum].artists[d.artist] === undefined)
          weekDict[d.weekNum].artists[d.artist] = 1;
        else
          weekDict[d.weekNum].artists[d.artist] += 1;
          
        if (weekDict[d.weekNum].genres[d.genre[0]] === undefined)
          weekDict[d.weekNum].genres[d.genre[0]] = 1;
        else
          weekDict[d.weekNum].genres[d.genre[0]] += 1;

        if (weekDict[d.weekNum].tracks[d.track] === undefined)
          weekDict[d.weekNum].tracks[d.track] = 1;
        else
          weekDict[d.weekNum].tracks[d.track] += 1;
      });
      
      // Sort the list of genres according to total play count
      sortedGenreList = Object.keys(totalPlaysByGenre).sort((a, b) => totalPlaysByGenre[b].plays - totalPlaysByGenre[a].plays);
      sortedArtistList = Object.keys(totalPlaysByArtist).sort((a, b) => totalPlaysByArtist[b] - totalPlaysByArtist[a]); 
      sortedTrackList = Object.keys(totalPlaysByTrack).sort((a, b) => totalPlaysByTrack[b].plays - totalPlaysByTrack[a].plays);
      console.log(sortedTrackList);
      Object.keys(weekDict).forEach(w => {
        const i = +w - 1;
        
        topArtists = sortedArtistList;//.slice(0, numArtists);
        topGenres = sortedGenreList;//.slice(0, numGenres);
        topTracks = sortedTrackList;
        
        var genreObj = {week: i + 1};
        var artistObj = {week: i + 1};
        var trackObj = {week: i + 1};
        
        topArtists.forEach(a => {
          artistObj[a] = weekDict[w].artists[a] ? weekDict[w].artists[a] : 0;
        });
        
        // artistObj['everything else'] = 0;
        // genreObj['everything else'] = 0;
        // Object.keys(weekDict[w].artists).forEach(a => {
        //   if (!topArtists.includes(a))
        //     artistObj['everything else'] += weekDict[w].artists[a];  
        // });
        byWeekPlaysArtist.push(artistObj);

        
        // Object.keys(weekDict[w].genres).forEach(g => {
        //   if (!topGenres.includes(g))
        //     genreObj['everything else'] += weekDict[w].genres[g];  
        // });
        
        topGenres.forEach(g => {
          genreObj[g] = weekDict[w].genres[g] ? weekDict[w].genres[g] : 0;
        });
        byWeekPlaysGenre.push(genreObj); 


        topTracks.forEach(g => {
          trackObj[g] = weekDict[w].tracks[g] ? weekDict[w].tracks[g] : 0;
        });
        byWeekPlaysTrack.push(trackObj); 
      });
      // topArtists.push('everything else');
      // console.log(topGenres)
      // topGenres.push('everything else');


      var toReturn = {}; 
      // toReturn.csvData = csvData; 
      toReturn.jsonData = genreHierarchy.data;
      toReturn.byWeekPlaysGenre = byWeekPlaysGenre.reverse(); 
      toReturn.byWeekPlaysArtist = byWeekPlaysArtist;
      toReturn.byWeekPlaysTrack = byWeekPlaysTrack;

      toReturn.totalPlaysByGenre = totalPlaysByGenre;
      toReturn.totalPlaysByArtist = totalPlaysByArtist;
      toReturn.totalPlaysByTrack = totalPlaysByTrack;

      toReturn.deepestGenresByArtist = deepestGenresByArtist;
      toReturn.topGenres = topGenres;
      toReturn.topArtists = topArtists;
      toReturn.topTracks = topTracks;

      toReturn.artistData = artistData;
      toReturn.trackData = trackData;

      console.log(toReturn);  
      return toReturn;  
    }).then(r => {return r;}); 
  };

  const treemap = (selection, props) => {
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

    console.log(deepestGenresByArtist);

    const topGenresTrimmed = topArtists.map(a => deepestGenresByArtist[a]);
    var maxGenreDepth = 0;
    
    const treeLayout = d3$1.cluster()
      .size([height, 0.7*width])
      .separation((a, b) => { 
        return (a.parent == b.parent ? 1 : 1); 
      });

    var root = d3$1.hierarchy(jsonData); 

    root.descendants().forEach(d => {
      maxGenreDepth = d.depth > maxGenreDepth ? d.depth : maxGenreDepth;
    }); 

    root.sort((a,b) => {
      var aLen = a.children === undefined ? -1 : a.children.length;
      var bLen = b.children === undefined ? -1 : b.children.length;
      return(bLen - aLen);
    });
    // console.log(root)
    
    const tree = treeLayout(root);
    var links = tree.links();   
   
    const linkPathGenerator = d3$1.linkHorizontal()
      .x(d => d.y)
      .y(d => d.x);

    const treeSpread = d3.max([width/7, 95]);
    selection.width = treeSpread * maxGenreDepth;

    selection.selectAll('path').data(links)
      .enter().append('path')
        .attr('d', linkPathGenerator);

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
        var artists = d.leaves();
        return d.data.artist ? 
          artists.forEach(l => onClickArtist(l.data.id)) :
          onClickGenre(artists.map(l => l.data.id))
      })
      .transition(200)
        .attr('opacity', d => {
          const path = root.path(d).map(p => p.data.id);

          var childNames = d.descendants().map(c => c.data.id);
          return (
            selectedLegendList.length == 0 || 
            selectedLegendList.some(r=> childNames.indexOf(r) >= 0) 
            ? 1 : 0.2
          )});

  };

  const stackedAreaVertical = (selection, props) => {
    const {
      dataToStack,
      topArtists,
      colorScale,
      selectedLegendList,
      width,
      height,
      numArtists,
      onClick,
      year,
      amplitude,
      position,
      stackOffset,
      stackOrder
    } = props;

    const topArtistsTrimmed = topArtists.slice(0, numArtists);
    
    selection
      .attr('transform', `rotate(-90)`);

    const g = selection.selectAll('.container').data([null]);
    const gEnter = g.enter()
      .append('g')
        .attr('class', 'container');

    const h = selection.selectAll('.axes').data([null]);
    const hEnter = h.enter()
      .append('g')
        .attr('class', 'axes');

    const artistText = selection.selectAll('.artist-text').data(selectedLegendList);
    const artistTextEnter = artistText.enter().append('g')
        .attr('class', 'artist-text d-block d-md-none')
        .attr('transform', 'translate(-20, 95) rotate(90)');
    
    artistTextEnter.merge(artistText)
      .append('text')
        .transition()
          .duration(500)
        .attr('x', '0')
        .attr('y', '0')
        .attr('fill', d => colorScale(d))
        .text(d => d);

    artistText.exit()
      .remove();
    
    // X-axis and scale
    // This converts from the week scale to a day scale
    const getDateFromWeek = (weekNumber) => {
      const numberOfDays = 7*(weekNumber-1)+1;
      return new Date(year, 0, numberOfDays);
    };

    const xScale = d3$1.scaleTime()
      .domain([
        new Date(year, 0, 1), 
        new Date(year, 11, 31)])
        // getDateFromWeek(max(Object.keys(dataToStack).map(d => parseInt(d, 10))))])
      .range([0, -height]);
      // .nice()

    const yScale = d3$1.scaleLinear()
      .domain([0, d3$1.max(dataToStack.map(d => d3$1.sum(Object.values(d))))])
      .range([0, width * amplitude])
      .nice(); 
    
    const xAxis = d3$1.axisBottom(xScale)
      .ticks(12)
      .tickSize(0)
      // .tickPadding(15)
      .tickFormat(d3.timeFormat('%B'));
    
    const xAxisG = g.select('.x-axis');
    const xAxisGEnter = gEnter
      .append('g').attr('class', 'x-axis');
    
    xAxisGEnter
      .merge(xAxisG)
        .call(xAxis)
        .selectAll('text')
          .attr('text-anchor', 'start')
          .attr('transform', `rotate(90) translate(0, 0)`);

    xAxisGEnter.merge(xAxisG).selectAll('.domain').remove();
    
    const yAxis = d3$1.axisLeft(yScale)
      .ticks('none');
      // .tickSize(-width)
      // .tickPadding(5)
      // .tickFormat(yAxisTickFormat);
    
    const yAxisG = g.select('.y-axis');
    const yAxisGEnter = gEnter
      .append('g')
        .attr('class', 'y-axis');
    
    yAxisGEnter
      .merge(yAxisG)
        .transition().duration(200)
        .call(yAxis);
    
    yAxisGEnter.merge(yAxisG).selectAll('.domain').remove();
    
    // yAxisGEnter.append('text')
    //   .attr('class', 'axis-label')
    //   .attr('y', -35)
    //   .attr('x', -height / 2)
    //   .attr('fill', 'black')
    //   .attr('transform', `rotate(-90)`)
    //   .attr('text-anchor', 'middle')
    //   .text(yAxisLabel);
    
    var stack = d3.stack(dataToStack)
      .keys(topArtistsTrimmed)
      .offset(stackOffset)
      .order(stackOrder);

    var series = stack(dataToStack);

    const areaGenerator = d3$1.area()
      .x(d => xScale(getDateFromWeek(d.data.week)))
      .y0(d => yScale(selectedLegendList.length != 0 && (selectedLegendList.includes(d.artist)) ? 0 : d[0]))
      .y1(d => yScale(selectedLegendList.length != 0 && (selectedLegendList.includes(d.artist)) ? d[1] - d[0] : d[1]))
      .curve(d3.curveBasis);
    
    const lines = selection.selectAll('.line-path').data(series);

    const linesEnter = lines.enter()
      .append('path')
        .attr('class', 'line-path') 
        .attr('fill', d => colorScale(d.key))
        .attr('transform', `translate(0, ${(width)/2 + position})`);

    lines.merge(linesEnter)
      .on('click', d => onClick(d.key))
      .attr('d', areaGenerator)
      .append('title')
        .text(d => d.key);
    
    lines.merge(linesEnter)
      .transition()
        .duration(200)
          .attr('opacity', d => {
            return (selectedLegendList.length == 0 || selectedLegendList.includes(d.key)) ? 1 : 0})
          .attr('stroke-width', d => (selectedLegendList.length != 0 || selectedLegendList.includes(d.key)) ? 0.05 : 0);

    // const annotations = []
    // csv('https://raw.githubusercontent.com/OxfordComma/oxfordcomma.github.io/master/concert_dates.csv').then(annotationData => {
    //   console.log(annotationData)
    //   annotationData.forEach(a => {
    //     a.date = new Date(a.date)
    //     // console.log(a.date)
    //     // console.log(xScale(a.date))
    //     annotations.push({
    //       note: {
    //         title: a.artists,
    //         label: a.date.getMonth()+1 + '/' + a.date.getDate() + ' at ' + a.venue
    //       },
    //       x: 0,
    //       y: -xScale(a.date), 
    //       dx: 0,
    //       dy: 0,
    //       connector: {
    //         curve: d3.curveLinear,
    //         points: [[0, 0]]
    //       },
    //       color: 'black'
    //     })
    //   });

    //   const makeAnnotations = d3.annotation()
    //   .editMode(true)
    //   //also can set and override in the note.padding property
    //   //of the annotation object
    //   .notePadding(15)
    //   .type(d3.annotationCallout)
    //   .annotations(annotations)

    //   d3.select(".stacked-area-container")
    //     .append("g")
    //     .attr("class", "annotation-group")
    //     .attr('transform', 'rotate(90)')
    //     .call(makeAnnotations)
    //   console.log(annotations)

    // });

    
  };

  var jsonData, artistData, byWeekPlaysGenre, byWeekPlaysArtist, totalPlaysByArtist;
  var artistColorScale, genreColorScale;
  var topArtists, topArtistsTrimmed, topGenres;
  var playScale;
  var selectedArtists = []; 
  var deepestGenresByArtist;

  var verticalAreaG, artistLegendG, treeG;
  var treeWidth, treeHeight, areaWidth, areaHeight;

  const numArtists = 40;
  const year = 2019;

  loadTreeData(
    '/data/music/tracks/'+year.toString(),
    '/data/music/artists/'+year.toString()).then(data => {
    jsonData = data.jsonData;
    artistData = data.artistData;
    byWeekPlaysGenre = data.byWeekPlaysGenre;
    byWeekPlaysArtist = data.byWeekPlaysArtist;
    topGenres = data.topGenres;
    topArtists = data.topArtists;
    deepestGenresByArtist = data.deepestGenresByArtist;
    totalPlaysByArtist = data.totalPlaysByArtist;


    treeWidth = document.getElementById('tree').clientWidth < 500 ? 1000 : document.getElementById('tree').clientWidth;
    treeHeight = 1000;
    
    areaWidth = document.getElementById('stacked-area-artist-vertical').clientWidth;
    areaHeight = treeHeight;  

    const verticalAreaSvg = d3$1.select('.stacked-area-artist-svg')
        .attr('height', areaHeight)
        .attr('width', areaWidth);

    // verticalAreaSvg.append('rect')
    //     .attr('width', '100%')
    //     .attr('height', '100%')
    //     .attr('fill', 'black')

    const treeSvg = d3$1.select('.tree')
      .attr('height', treeHeight)
      .attr('width', treeWidth);

    // treeSvg.append('rect')
    //     .attr('width', '100%')
    //     .attr('height', '100%')
    //     .attr('fill', 'black')

    verticalAreaG = verticalAreaSvg.append('g')
      // .attr('class', 'd-none d-md-block')
      .attr('transform', `translate(${0}, ${0}), rotate(90)`);

    artistLegendG = verticalAreaSvg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${5},${5})`);

    treeG = treeSvg.append('g')
      .attr('class', 'tree');


    topArtistsTrimmed = topArtists.slice(0, numArtists);
    const topGenresTrimmed = topArtistsTrimmed.map(a => deepestGenresByArtist[a]);
    addArtistsToTree(topArtistsTrimmed, jsonData);
    removeEmptyLeaves(jsonData);
    
    topArtistsTrimmed = d3$1.hierarchy(jsonData).leaves().map(d=>d.data.id);


    artistColorScale = d3$1.scaleOrdinal()
      .domain(topArtistsTrimmed);

    const n = artistColorScale.domain().length;
    
    artistColorScale
      .range(artistColorScale.domain().map((d, i) => d3$1.interpolateRainbow(i/(n+1))));

    genreColorScale = d3$1.scaleOrdinal()
      .domain(topGenres)
      .range(d3$1.schemeCategory10);

    playScale = d3$1.scaleSequential(d3$1.interpolatePlasma)
      .domain([0, d3$1.max(Object.values(totalPlaysByArtist)) + 100]);

    render();
  });

  const onClickGenre = d => {
    selectedArtists = selectedArtists.sort().join(',') === d.sort().join(',') ? [] : d;
    console.log(selectedArtists);
    render(); 
  };

  const onClickArtist = d => {

    if (!selectedArtists.includes(d))
      selectedArtists.push(d);
    else
    selectedArtists = selectedArtists.filter(val => val != d);
    console.log(selectedArtists);
    render(); 
  };

  const addArtistsToTree = function(artists, t) {
      artists.forEach(a => (deepestGenresByArtist[a] == t.id ? t.children.push({id: a, artist: true, children: []}) : 1));
      if (t.children)
        t.children.forEach(c => addArtistsToTree(artists, c));
    };

  const removeEmptyLeaves = function(t) {
      if (t.children.length > 0)
      {
        var toRemove = [];
        t.children.forEach(c => {
          removeEmptyLeaves(c);

          if (!c.artist && c.children.length == 0)
            toRemove.push(c.id);
        });
        if (toRemove)
          t.children = t.children.filter(c => !toRemove.includes(c.id));
      }
    };

  const render = () => {
    treeG.call(treemap, {
      jsonData,
      deepestGenresByArtist,
      totalPlaysByArtist,
      topArtists,
      width: treeWidth,
      height: treeHeight,
      colorScale: artistColorScale,
      selectedLegendList: selectedArtists,
      onClickArtist: onClickArtist,
      onClickGenre: onClickGenre
    });

    verticalAreaG.call(stackedAreaVertical, {
      dataToStack: byWeekPlaysArtist,
      topArtists: topArtistsTrimmed,
      colorScale: artistColorScale,
      selectedLegendList: selectedArtists,
      width: areaWidth,
      height: areaHeight,
      numArtists: numArtists,
      onClick: onClickArtist,
      year: 2019,
      amplitude: 1,
      position: 0,
      stackOffset: d3.stackOffsetWiggle
      // stackOrder:
    });

    // artistLegendG.call(colorLegend, {
    //   colorScale: artistColorScale,
    //   circleRadius: 5,
    //   spacing: 15,
    //   textOffset: 12,
    //   backgroundRectWidth: 135,
    //   onClick: onClickArtist,
    //   selectedLegendList: selectedArtists,
    //   numArtists: numArtists
    // });
  };

}(d3));
//# sourceMappingURL=treeBundle.js.map