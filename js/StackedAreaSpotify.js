import React from 'react'
import ReactDOM from 'react-dom'
import ErrorBoundary from './ErrorBoundary.js'
// import StackedAreaLegend from './StackedAreaLegend.js'
import StackedArea from './StackedArea.js'
import Legend from './Legend.js'
import * as d3 from 'd3'

class StackedAreaSpotify extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			jsonData: [],
			seriesData: [],
			selectedLegendItems: [],

			legendBy: d => d['artists'][0],
			nestBy: d => this.getWeekDateTime(d.listen_date),
			legendLimit: 10,
			username: document.getElementById('username').getAttribute("username").toString(),
			// pages: (document.getElementById('pages').getAttribute("pages")).toString(),
		}

		this.xFunction = d => new Date(d.listen_date)
		// this.numTicks = 3
		// this.drawWidth = this.props.width - this.props.margin.left - this.props.margin.right;
		// this.drawHeight = this.props.height - this.props.margin.top - this.props.margin.bottom;

		this.onClickLegend = this.onClickLegend.bind(this)
		this.onClickChartItem = this.onClickChartItem.bind(this)
		this.onClickBackground = this.onClickBackground.bind(this)
		
		this.getLegendItems = this.getLegendItems.bind(this)
		this.getWeekDateTime = this.getWeekDateTime.bind(this)
		this.colorScale = d3.scaleOrdinal(d3.schemeCategory10)
	}

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

	getLegendItems() {
		// var legendItems = this.state.seriesData.map(d => d.key).sort()
		var legendItems = [...new Set(this.state.jsonData.map(item => this.state.legendBy(item)))]

		// console.log(legendItems)
		return legendItems
	}

	componentDidUpdate() {
		// this.colorScale 
		// // = d3.scaleOrdinal(d3.schemeCategory10)
		// 	.domain(this.getLegendItems())
	}

	componentDidMount() {
		// var userData = fetch("/data/user?username="+this.state.username.toLowerCase())
		// 	.then(data => data.json())
		// 	.then(res => console.log(res))

		var dataUrl = "/data/spotify"//+this.state.username
		d3.json(dataUrl, (err, data) => {
		// var data = 
			// console.log(data)
			// Counts for each category
			var counts = d3.nest()
				.key(this.state.legendBy)
				.rollup(v => v.length)
				.entries(data)
				.sort((a, b) => b.value - a.value)

			// console.log(counts)

			var legendItems = counts.slice(0, this.state.legendLimit).map(i => i.key)
			data = data
				// .map(d => { d.selected = true; return d })
				.filter(d => legendItems.includes(this.state.legendBy(d)))
				.sort()

			//set limit to 1 year ago
			var lowLimit = new Date(new Date().setDate(new Date(data[data.length-1].listen_date).getDate()-365));
			// console.log(new Date(data[data.length-1].listen_date))
			// console.log(lowLimit)

			this.xMin = d3.min(data.map(d => this.state.nestBy(d)).filter(d => d >= lowLimit))
			this.xMax = d3.max(data.map(d => this.state.nestBy(d)))
			console.log(this.xMin)
			console.log(this.xMax)
			this.yMin = 0
			this.yMax = 350


			var months = (this.xMax.getFullYear() - this.xMin.getFullYear()) * 12;
			months += this.xMax.getMonth() - this.xMin.getMonth();
			if (this.xMax < this.xMin) {
					months--;
			}
			this.numTicks = months

			// console.log(months)

			// Data by week
			var obj = {}
			legendItems.forEach(l => obj[l] = 0)
			// console.log(obj)     
			
			// dataByWeek
			// needs to be .object in order to stack properly
			var nest = d3.nest()
				.key(this.state.nestBy)
				.key(this.state.legendBy)
				.rollup(v => {
						// console.log(v)
						return v.length
				})
				.object(data)

			// console.log(nest)

			// Create a range of datetimes from xMin to xMax
			var tempDate = this.xMin
			var xWeekValues = []
			while (tempDate <= this.xMax) {
				// console.log(this.getWeekDateTime(tempDate))
				xWeekValues.push(this.getWeekDateTime(tempDate))
				tempDate = new Date(tempDate.setDate(tempDate.getDate()+7));
				// console.log(tempDate)
			}

			// console.log(xWeekValues)
			// this.numTicks = xWeekValues.length / 4
			// Reconfigure for stacking
			// var toStack = Object.keys(nest).map(k => {
			var toStack = xWeekValues.map(k => {
				var toReturn = { key: k, ...nest[k] }
				// console.log(toReturn)
				return toReturn
			})

			// Add in missing values for 0 
			toStack.forEach(n => {
				legendItems.forEach(d => {
					if (!(d in n))
						n[d] = 0
				})
			})
			// console.log(toStack)
	
			var stack = d3.stack()
					.keys(legendItems)
					.offset(d3.stackOffsetWiggle)
					.order(d3.stackOrderInsideOut)
			// console.log(stack)

			var series = stack(toStack)

			// dataToStack
			series = series.map(d => { d.selected = true; return d })
			console.log(series)

			this.setState({ jsonData: data })
			this.setState({ seriesData: series });
			this.setState({ selectedLegendItems: this.getLegendItems() })
		})
	}

	onClickLegend(item) {
		console.log('legend click')
		console.log(item)
		// var currentData = this.props.seriesData
		var currentData = this.state.seriesData
		var currentSelection = this.state.selectedLegendItems
		var newSelectedLegendItems

		if (currentSelection.length == 1 && currentSelection[0] == item)
			newSelectedLegendItems = this.getLegendItems()
		else
			newSelectedLegendItems = [item]
		
		var newData = currentData.map(d => {
			d.selected = newSelectedLegendItems.includes(d.key) ? true : false
			return d
		})

		this.setState({ seriesData: newData })
		this.setState({ selectedLegendItems: newSelectedLegendItems })
	}

	onClickChartItem(item) {
		console.log('data click')
		console.log(item)
		var currentData = this.state.seriesData
		var currentlySelected = currentData.filter(d => d.selected == true)
		var newData
		var newSelectedLegendItems

		if (currentlySelected.length == 1 && currentlySelected[0] == item){
			newData = currentData.map(d => { d.selected = true; return d })
			newSelectedLegendItems = this.getLegendItems()
		}
		else {
			newData = currentData.map(d => {
				d.selected = d==item ? true : false
				return d            
			})
			newSelectedLegendItems = [item.key]
			// console.log(newSelectedLegendItems)

		}
		this.setState({ seriesData: newData })
		this.setState({ selectedLegendItems: newSelectedLegendItems })
	}

	onClickBackground() {
		console.log('background click')
		var currentData = this.state.seriesData
		var newSelectedLegendItems = this.getLegendItems()
		var newData = currentData.map(d => {
			d.selected = true
			return d
		})
		this.setState({ seriesData: newData })
		this.setState({ selectedLegendItems: newSelectedLegendItems })
	}

	render() {
		// console.log('stacked area legend render')
		return (
			<div id='lastfm' className='container'>
				<link href="https://fonts.googleapis.com/css?family=Playfair+Display&display=swap" rel="stylesheet"/>
				<svg className="stacked-area" width={window.innerWidth} height={window.innerHeight}>
					<StackedArea
						width={window.innerWidth}
						height={window.innerHeight}
						// xValue={'a'}
						// yValue={'b'}
						seriesData={this.state.seriesData}
						// xFunction={this.xFunction}
						xDomain={[this.xMin, this.xMax]}
						yDomain={[this.yMin, this.yMax]}
						// jsonData={this.state.jsonData}
						numTicks={this.numTicks}
						// yMax={this.yMax}
						// legendBy={this.state.legendBy}
						// legendItems={this.getLegendItems()}
						// selectedLegendItems={this.state.selectedLegendItems}
						colorScale={this.colorScale}
						// onClickLegend={this.onClickLegend}
						onClickChartItem={this.onClickChartItem}
						onClickBackground={this.onClickBackground}
						/>
					<Legend
						id='legend'
						chartWidth={window.innerWidth}
						// height={20}
						offset={0}
						direction={'vertical'}
						align={'right'}
						// data={this.props.seriesData}
						legendItems={this.getLegendItems()}
						selectedLegendItems={this.state.selectedLegendItems}
						onClickLegend={this.onClickLegend}
						// onClickBackground={this.onClickBackground}
						colorScale={this.colorScale}
						/>
					</svg>
			</div>
		)
	}
}

// Render application
ReactDOM.render(
	<ErrorBoundary>
		<StackedAreaSpotify/>
	</ErrorBoundary>,
	document.getElementById('root')
);