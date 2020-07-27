import React, { useRef, useEffect } from 'react';
import * as d3 from "d3";
import { geoConicConformalSpain } from "d3-composite-projections";
import { feature } from 'topojson-client';

import './map.css';
import spainCanaryMap from '../../maps/spain-canary-provinces.json';

export const Map = () => {
  console.log(spainCanaryMap);

  d3.json('https://run.mocky.io/v3/552a0b8f-2713-48e2-9c94-a9815a563ce4').then(data => {
    processData(data)
  })

  const width = 950, height = 600;
  const svgMap = useRef();
  const pathGroup = useRef();

  const provinces = feature(spainCanaryMap, spainCanaryMap.objects.ESP_adm2).features;

  const projection = geoConicConformalSpain();

  const path = d3.geoPath().projection(projection);

  const zoom = d3.zoom()
    .scaleExtent([1, 3])
    .extent([[0, 0], [width, height]])
    .on("zoom", zoomed);

  function zoomed() {
    const g = d3.select(pathGroup.current);
    g.attr("transform", d3.event.transform);
  }

  function onZoomIn() {
    const svg = d3.select(svgMap.current);
    svg.call(zoom.scaleBy, 2);
  }

  function onZoomOut() {
    const svg = d3.select(svgMap.current);
    svg.call(zoom.scaleBy, 0.5);
  }

  const ctaBubbleScale = d3.scaleSqrt()
    .range([4, 18]) // radius pixels from to

  function processData(data) {
    console.log(data);

    var extent = d3.extent(data, d => d.value);
    ctaBubbleScale.domain(extent);

    var onlyDestination = data.map(d => {
      const destination = { ...d.destination, value: d.value, }
      return destination;
    })

    // draw destination bubbles
    d3.select(pathGroup.current).selectAll("circle.airport")
      .data(onlyDestination)
      .enter()
      .append("circle")
      .attr("r", d => {
        return ctaBubbleScale(d.value)
      })
      .attr("cx", d =>
        projection([d.coordinates.longitude, d.coordinates.latitude,
        ])[0]
      )
      .attr("cy", d =>
        projection([d.coordinates.longitude, d.coordinates.latitude,
        ])[1]
      )
      .attr("class", d => "ctaDestinationBubble " + d.centerName)

    var shipmentRoutes = processShipments(data)

    var line = d3.line()
      .x(d => d.x)
      .y(d => d.y)
      .curve(d3.curveCatmullRom.alpha(0))

    // draw lines
    d3.select(pathGroup.current).selectAll("path.flight")
      .data(shipmentRoutes)
      .enter()
      .append('path')
      .attr('d', line)
      .attr('class', 'shipment-line')
  }

  function processShipments(shipments) {
    const shipmentRoutes = [];
    shipments.forEach(shipment => {
      var routePoints = [];

      var sourceCoords = projection([shipment.origin.coordinates.longitude, shipment.origin.coordinates.latitude]);
      var targetCoords = projection([shipment.destination.coordinates.longitude, shipment.destination.coordinates.latitude]);

      routePoints.push({
        x: sourceCoords[0], y: sourceCoords[1]
      });

      routePoints.push({
        x: targetCoords[0], y: targetCoords[1]
      });

      shipmentRoutes.push(routePoints)
    })
    return shipmentRoutes;
  }

  useEffect(() => {
    if (svgMap.current) {
      const svg = d3.select(svgMap.current)
      svg
        .call(zoom)
    }
  }, [zoom])

  return (
    <>
      <button
        className="zoom-button"
        onClick={onZoomIn}>Zoom In</button>
      <button className="zoom-button"
        onClick={onZoomOut}>Zoom Out</button>
      <svg
        ref={svgMap}
        className="map-svg"
        preserveAspectRatio={`xMidYMid meet`}
        viewBox={`0 0 ${width} ${height}`}>
        <g ref={pathGroup}>
          {provinces.map(province => {
            return (
              <path
                className={`province ${province.properties.NAME_2}`}
                d={path(province)}
                key={`${province.properties.NAME_2}`}
              />)
          })}
          <path
            d={projection.getCompositionBorders()}
            className="canary-separator"
          />
        </g>
      </svg>
    </>
  )
}