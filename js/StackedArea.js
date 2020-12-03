import React from 'react'
import * as d3 from 'd3'

// Scatterplot
class StackedArea extends React.Component {
	constructor(props) {
		super(props);
		// Graph width and height - accounting for margins
		
		this.chartAreaRef = React.createRef()

	}
	componentDidMount() {
		this.update();
	}

	componentDidUpdate() {
		this.update();
	}

	updateScales() {
		this.drawWidth = this.props.width - this.props.margin.left - this.props.margin.right;
		this.drawHeight = this.props.height - this.props.margin.top - this.props.margin.bottom;
		console.log(this.drawWidth)
		console.log(this.drawHeight)

		// Define scales
		this.xScale = d3.scaleUtc()
			.domain(this.props.xDomain)
			.range([0, this.drawHeight])
			// .nice()

		this.yScale = d3.scaleLinear()
			.domain(this.props.yDomain)
			.range([0, this.drawWidth])
			.nice();
	}

	updateBackground() {
		let background = d3.select(this.chartAreaRef.current).selectAll('rect').data([null])
		var backgroundEnter = background.enter().append('rect')
			.attr('class', 'chart-background')
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', this.props.width)
			.attr('height', this.props.height)
			.attr('opacity', 0)

		backgroundEnter.merge(background)
			.on('click', d => this.props.onClickBackground(d))
	}

	updateChartArea() {

		const areaGenerator = d3.area()
			.x(d => {
				// console.log(d.data.key)
				var x = this.xScale(new Date(d.data.key))
				// console.log(x)
				return x
			})
			.y0(d => {
				var y0 = this.yScale(d[0])
				// console.log(y0)
				return y0 
			})
			.y1(d => {
				var y1 = this.yScale(d[1])
				// console.log(y1)
				return y1
			})
			.curve(d3.curveBasis);
		
		const g =  d3.select(this.chartAreaRef.current)
			.selectAll('.lines')
			.data([null])
			.enter().append('g').attr('class', 'lines')


		const lines = d3.select('.lines').selectAll('.line-path').data(this.props.seriesData);

		const linesEnter = lines.enter()
			.append('path')
				.attr('class', 'line-path') 
				.attr('fill', d => {
					// console.log(d)
					return this.props.colorScale(d.key)
				})
				.attr('transform', `translate(${(this.props.width)/2}, 0) rotate(90)`)
				.attr('d', areaGenerator)

		lines.merge(linesEnter)
			.on('click', d => this.props.onClickChartItem(d))
			// .append('title')
			// 	.text(d => d.key)
		
		lines.merge(linesEnter)
			.transition()
				.duration(200)
					.attr('opacity', d => d.selected ? 1 : 0.1)
					.attr('stroke-width', 1)
	}
	updateAxes() {
		// console.log(this.props.seriesData)
		const xAxis = d3.axisLeft(this.xScale)
			.ticks(this.props.numTicks)
			.tickSizeInner(-this.drawWidth)
			// .tickPadding(15)
			.tickFormat(d => {
				// console.log(d)
				// return (d3.utcFormat('%B')(d) == 'January') ? d3.utcFormat('%B %Y')(d) : d3.utcFormat('%B')(d);
				return d3.utcFormat('%B %Y')(d)
			})

		const g = d3.select(this.chartAreaRef.current)
			// .attr('transform', 'rotate(-90)')
			.selectAll('.axes').data([null]);

		const gEnter = g.enter()
			.append('g')
				.attr('class', 'axes');
		
		const xAxisG = g.select('.x-axis')
			// .enter();
		const xAxisGEnter = gEnter
			.append('g').attr('class', 'x-axis')
			.attr('transform', `translate(0, 0)`)

		xAxisGEnter
			.merge(xAxisG)
				.call(xAxis)
				.raise()

				.attr('font-family', null)
				.selectAll('text')
					.attr('text-anchor', 'start')
					.attr('opacity', 1)
					.attr('transform', `translate(5, 15)`);

		xAxisGEnter.merge(xAxisG)
			.selectAll('line')
				.attr('stroke', 'currentColor')
				.attr('stroke-width', 1)
				.attr('opacity', 1)
				
				// .attr('transform', 'translate(20, 20)')

		// xAxisGEnter.merge(xAxisG).selectAll('.domain').remove()
		
		// xAxisGEnter.append('text')
			// .attr('class', 'axis-label')
			// .attr('transform', `rotate(90)`)
			// .attr('y', 50)
			// .attr('x', 0 / 2)
			// .attr('fill', 'black')
			// .text(xAxisLabel);

		// const yAxisTickFormat = number =>
		// format('.2s')(number)
			// .replace('.0', '');
		
		const yAxis = d3.axisTop(this.yScale)
			.ticks('none')
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
			// .attr('class', 'axis-label')
			// .attr('y', -35)
			// .attr('x', -height / 2)
			// .attr('fill', 'black')
			// .attr('transform', `rotate(-90)`)
			// .attr('text-anchor', 'middle')
			// .text(yAxisLabel);
	}
	update() {
		this.updateBackground()
		this.updateScales();
		this.updateChartArea();
		this.updateAxes();

	}

	render() {
		if (this.props.width == undefined || this.props.height == undefined) {
			return <g ref={this.chartAreaRef}
					transform={`translate(${this.props.margin.left}, ${this.props.margin.top})`} />
		}

		return (
			<svg ref={this.chartAreaRef} 
				className="stacked-area" width={this.props.width} height={this.props.height} transform={`translate(${this.props.margin.left}, ${this.props.margin.top})`}>
			</svg>
		)
	}
}

StackedArea.defaultProps = {
	seriesData: [],
	margin: {
		left: 0,
		right: 0,
		top: 0,
		bottom: 0
	}
};

export default StackedArea