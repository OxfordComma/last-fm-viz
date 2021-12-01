import React from 'react'
import ReactDOM from 'react-dom'
import ErrorBoundary from './ErrorBoundary.js'
// import StackedAreaLegend from './StackedAreaLegend.js'
import StackedArea from './StackedArea.js'
import Legend from './Legend.js'
import * as d3 from 'd3'

class StackedAreaLastFm extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			jsonData: [],
			seriesData: [],
			selectedLegendItems: [],

			legendBy: d => d['artist']['#text'],
			nestBy: d => this.getWeekDateTime(d.date['#text']),
			legendLimit: 20,
			username: JSON.parse(document.currentScript.getAttribute('username')).username,
			oneYear: JSON.parse(document.currentScript.getAttribute('oneyear')).oneyear
		}

		this.onClickLegend = this.onClickLegend.bind(this)
		this.onClickChartItem = this.onClickChartItem.bind(this)
		this.onClickBackground = this.onClickBackground.bind(this)
		
		this.getLegendItems = this.getLegendItems.bind(this)
		this.getWeekDateTime = this.getWeekDateTime.bind(this)
		this.colorScale = d3.scaleOrdinal(d3.schemeCategory10)

		this.graphRef = React.createRef()
		this.legendRef = React.createRef()
		this.svgRef = React.createRef()
	}

	// Helper functions
	getWeekDateTime(date) {
		Date.prototype.getWeek = function() {
			var onejan = new Date(this.getFullYear(), 0, 1);
			var weekNum = Math.ceil((((this - onejan) / 86400000) + onejan.getDay()-1)/7);
			return weekNum
			// return weekNum > 52 ? 52 : weekNum
		}
		date = new Date(date)
		var dayFromWeek = ((date.getWeek()-1) * 7 + 1)
		var dateFromWeek = new Date(date.getFullYear(), 0, dayFromWeek)
		return dateFromWeek
	}

	getLegendItems () {
			return this.state.seriesData.map(d => d.key)
	}


	async componentDidMount() {
		var dataUrl = "/data/music/lastfm/tracks?username="+this.state.username
		console.log(this.state)
		if (this.state.oneYear !== undefined && this.state.oneYear == 'true') {
			console.log('Start and end date')
			dataUrl = "/data/music/lastfm/tracks/oneyear?username="+this.state.username
		}
		var data = await d3.json(dataUrl)
		data = data.filter(d => d.date)
		console.log(data)
		// console.log(data.map(d => d.date))
		
		var counts = d3.nest()
			.key(this.state.legendBy)
			.rollup(v => v.length)
			.entries(data)
			.sort((a, b) => b.value - a.value)

		// Counts of the artists
		console.log(counts)

		// Slice the counts to find the top N
		var topItems = counts.slice(0, this.state.legendLimit).map(i => i.key)

		// Slice the data to find the top N
		data = data.filter(d => topItems.includes(this.state.legendBy(d)))

		// //set limit to 1 year ago
		// var lowLimit = new Date(new Date().setDate(new Date(data[data.length-1].date['#text']).getDate()-365));

		this.xMin = d3.min(data.map(d => this.state.nestBy(d)))//.filter(d => d >= lowLimit))
		this.xMax = d3.max(data.map(d => this.state.nestBy(d)))
		// console.log(this.xMin)
		// console.log(this.xMax)
		this.yMin = 0
		this.yMax = 350

		// Get the total number of months in the data
		var months = (this.xMax.getFullYear() - this.xMin.getFullYear()) * 12;
		months += this.xMax.getMonth() - this.xMin.getMonth();
		if (this.xMax < this.xMin) {
			months--;
		}
		this.numTicks = months

		var nest = d3.nest()
			.key(this.state.nestBy)
			.key(this.state.legendBy)
			.entries(data)

		console.log(nest)

		var stack = d3.stack()
			.keys(topItems)
			.value((d, key) => {
				// console.log(d)
				// console.log(key)
				return d.values.map(v => v.key).includes(key) ? 
					d.values.filter(v => v.key == key)[0].values.length : 
					0
			})
			.offset(d3.stackOffsetWiggle)
			.order(d3.stackOrderInsideOut)
		
		// console.log(stack)

		var series = stack(nest)

		series = series.map(d => { d.selected = true; return d })
		console.log(series)

		this.setState({ jsonData: data })
		this.setState({ seriesData: series });
	}

	onClickLegend(item) {
		console.log('legend click')
		console.log(item)
		var currentSeriesData = this.state.seriesData

		var newSeriesData = currentSeriesData.map(d => {
			d.selected = (d.key == item)
			return d
		})

		this.setState({ seriesData: newSeriesData })
	}

	onClickChartItem(item) {
		console.log('data click')
		console.log(item)
		var currentData = this.state.seriesData
		var currentlySelected = currentData.filter(d => d.selected == true)
		var newData

		if (currentlySelected.length == 1 && currentlySelected[0] == item){
			newData = currentData.map(d => { d.selected = true; return d })
		}
		else {
			newData = currentData.map(d => {
				d.selected = d==item ? true : false
				return d
			})
		}
		this.setState({ seriesData: newData })
	}

	onClickBackground() {
		console.log('background click')
		var currentData = this.state.seriesData
		var newData = currentData.map(d => {
			d.selected = true
			return d
		})
		this.setState({ seriesData: newData })
	}

	render() {
		console.log(this.graphRef.current?.clientHeight)
		return (
			<div id='lastfm' className='container'>
				<div className='legend' ref={this.legendRef}>
					<Legend
						// svg={this.svgRef}
						// width={this.legendRef.current?.offsetWidth}
						// height={this.legendRef.current?.offsetHeight}
						direction={'vertical'}
						legendItems={this.getLegendItems(this.state.jsonData)}
						selectedLegendItems={this.state.seriesData.filter(d => d.selected).map(d => d.key)}
						onClickLegend={this.onClickLegend}
						colorScale={this.colorScale}
						legendBy={this.state.legendBy}
					/>
				</div>
				<div className='chart' ref={this.graphRef}>
					<StackedArea
						// svg={this.svgRef}
						width={this.graphRef.current?.clientWidth * 0.8}
						// width={window.innerWidth * 0.8}
						height={this.graphRef.current?.clientHeight}
						seriesData={this.state.seriesData}
						xDomain={[this.xMin, this.xMax]}
						yDomain={[this.yMin, this.yMax]}
						numTicks={this.numTicks}
						colorScale={this.colorScale}
						onClickChartItem={this.onClickChartItem}
						onClickBackground={this.onClickBackground}
						radius={parseInt(window.innerWidth/100)}
					/>
				</div>
				
				<div className='footer'>
					<p style={{'text-align': 'right'}}>Powered by <a href={'http://last.fm/user/'+this.state.username}>Last FM</a></p>
				</div>
			</div>
		)
	}
}

// Render application
ReactDOM.render(
	<ErrorBoundary>
		<StackedAreaLastFm/>
	</ErrorBoundary>,
	document.getElementById('root')
);