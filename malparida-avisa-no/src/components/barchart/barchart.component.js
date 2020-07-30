import React, { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import './barchart.css';

export const Barchart = () => {

  var svgRef = useRef();

  var rectWidth = 100;
  var height = 300;
  var data = [
    [100, 250, 175, 200, 120],
    [230, 120, 300, 145, 75, 250],
    [240, 250, 100]
  ];

  var colors = d3.scaleOrdinal(d3.schemeCategory10);

  var updateBars = useCallback((data) => {
    var svg = d3.select(svgRef.current)
      .style('transform', 'translate(85px,50px)');

    var t = d3.transition().duration(2000);

    var bars = svg.selectAll('rect')
      .data(data, d => d);

    // exit
    bars.exit().transition(t)
      .attr('y', height)
      .attr('height', 0)
      .remove();

    // enter
    var enter = bars.enter().append('rect')
      .attr('width', rectWidth)
      .attr('stroke', '#fff')
      .attr('y', height)
      .attr('x', (d, i) => i * rectWidth);

    // enter + update
    bars = enter.merge(bars)
      .attr('fill', d => colors(d))
      .transition(t)
      .attr('x', (d, i) => i * rectWidth)
      .attr('y', d => height - d)
      .attr('height', d => d);

  }, [colors, height, rectWidth])

  useEffect(() => {
    var index = 0;
    setInterval(() => {
      updateBars(data[index % 3]);
      index += 1;
    }, 2000);
  }, [data, updateBars])

  return (
    <svg className="svg-element" ref={svgRef}></svg>
  )
}
