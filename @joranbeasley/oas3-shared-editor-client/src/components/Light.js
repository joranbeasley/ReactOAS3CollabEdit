import React from "react";
export function StatusLight({color,style}){
  const colors = {
    'red':['rgb(255,10,10)','rgb(255, 126, 126)'],
    'green':['rgb(0, 107, 27)','rgb(129, 255, 160)'],
    'yellow':['rgb(255, 120, 5)','rgb(246, 234, 97)'],
    'orange':['rgb(255, 120, 5)','rgb(246, 234, 97)']
  }
  const [start_color,stop_color] = colors[color]
  return (
    <svg viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg" width={15} height={15} style={{...(style||{})}}>
  <defs>
    <linearGradient id="fill_color" >
      <stop style={{stopColor:start_color}} offset="0"/>
      <stop style={{stopColor:stop_color}} offset="1"/>
    </linearGradient>
    <linearGradient gradientUnits="userSpaceOnUse" x1="595.815" y1="220.369" x2="595.815" y2="265.631" id="gradient-0" gradientTransform="matrix(-0.110559, 0.92129, -0.212327, -0.021895, 712.398455, -296.784896)">
      <stop offset="0" style={{stopColor: "rgba(216, 216, 216, 1)"}}/>
      <stop offset="1" style={{stopColor: "rgba(165, 165, 165, 1)"}}/>
    </linearGradient>
    <linearGradient id="gradient-1-0" gradientUnits="userSpaceOnUse"
                    x1="148.515" y1="35.195" x2="148.515" y2="177.127"
                    gradientTransform="matrix(1, 0, 0, 1, 0, 0)"
                    />
  </defs>
  <g transform="matrix(0.160085, 0, 0, 0.160085, -10.780029, -3.954457)">
    <g>
      <circle style={{stroke: "rgb(161, 161, 161)", strokeWidth: '10px', fill: 'url(#fill_color)'}} cx="148.515" cy="106.161" r="70.966"></circle>
      <path style={{fill: "url(#gradient-0)"}} transform="matrix(1.179745, -2.12354, 1.757641, 0.976468, -963.087036, 1108.242432)" d="M 584.988 220.369 A 22.653 22.653 0 0 1 584.988 265.631 A 29.94 29.94 0 0 0 584.988 220.369 Z" ></path>
    </g>
  </g>
</svg>)
}
