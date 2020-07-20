import React, { useRef, useEffect } from 'react';
import * as d3 from "d3";
import { geoConicConformalSpain } from "d3-composite-projections";
import { feature, merge } from 'topojson-client';

import './map.css';
import spainCanaryMap from '../../maps/spain-canary-provinces.json';
import es from '../../maps/es.json';
import { geoMercator } from 'd3';

export const Map = () => {
  console.log(spainCanaryMap);

  const topo = es.map(({ lat, lng, ...rest }) => {
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      properties: rest
    }
  })

  const width = 950, height = 600;
  const svgMap = useRef();
  const pathGroup = useRef();

  const provinces = feature(spainCanaryMap, spainCanaryMap.objects.ESP_adm2).features;

  //const mergedPolygon = merge(spainCanaryMap, spainCanaryMap.objects.ESP_adm2.geometries)
  //const projection = geoMercator().fitSize([width, height], mergedPolygon);

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
            console.log('province', province);
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
          {topo.map(city => {
            console.log('city', city);
            return (
              <path
                className={`city ${city.properties.city}`}
                d={path(city)}
                key={`${city.properties.city}`}
              />)
          })}
        </g>
      </svg>
    </>
  )
}