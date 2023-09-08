import React, { useEffect, useRef, useState } from 'react';
//mport { barChart } from './d3Vis.js';
import * as d3 from 'd3';
import { Typography } from '@mui/material';


// a bar is a row of makers.. each one is build from the row data. 
// one bar = one row of makers -- //
// each bar has a row of makers a data set from the row data.. 
const BarsComponent = ({ data, index, onData, testFunction }) => {
  const svgRef = useRef(null); // this is the thing that gets updated.. 
  const headingRef = useRef(null);
  // -- 
  let block; // useRef(null);
  let blockItems; 
  let blockGroup;
  let ypos;

  let type; 

  useEffect(()=> { 
    
    //onData("hello this is some data")// send data to parent... 

  }), [ ]

  //--  updated when data is updated // 
  useEffect(() => {
    // --  draw bar chart 
    // -- add interaction -- //
    // console.log ('bar data = ', data); 
    type = data[0].type.replace('cluster', '');
    // console.log ('type = ', type)

    ypos = (index * 250)+20; 
    let element = " "
    if (index == 0 ) element = "London"
    if (index == 1 ) element = "Clockmakers"
    const headingContainer = d3.select (headingRef.current)
    headingContainer.attr('x', -150).attr('y', ypos+20); 
    const headingText = type;
    headingContainer.text(headingText + " = " + element);

    

    //drawBlocks()
    drawBlockGroup( );
    // // findBlockByMaker( )

    // // update block data in parent - so that links can be drawn -- //
    const barData = { id: index, data: blockGroup};
    onData(barData)

  }, [data]);


function drawBlocks ( ) { 
    // draw data.. 
    //console.log ('draw block')
    let svg = d3.select(svgRef.current)
    block  = svg.selectAll ('.block').data (data)

    //block.append ('rect').attr('x', 100).attr('y', 100).attr('width', 100).attr('height', 40).attr('fill', 'white')

    // -- Draw A Block for each data item 
    // -- update --  //I think this should be a group -- 
    // then add each node element into the group !!! 
    let spacing = 10; 

    block
        .attr('y', ypos)
        .transition ( )
        .duration (1000)
        .attr('x', (d, i)  => { 
           const sum = data
              .slice(0, i) // Get the preceding items
              .reduce((accumulator, item) => accumulator + item.nodes.length+spacing, 0);
           return sum + spacing
          }) 
      
        .attr('width', d => d.nodes.length)

    // -- Enter new groups -- how the first enter -- 
    block
        .enter()
        .append('rect')
        .attr ('class', 'block')
        .attr('x', (d, i)  => { 
           const sum = data
              .slice(0, i) // Get the preceding items
              .reduce((accumulator, item) => accumulator + item.nodes.length+spacing, 0);
           return sum + spacing
          }) 
        .attr('y', ypos)
        .attr('width', d => d.nodes.length )
        .attr('height', 20)
        .attr('fill', 'DodgerBlue')

    // -- remove -- how they leave
    block.exit()
       .remove();



}

function drawBlockGroup ( ) { 
    let svg = d3.select(svgRef.current)

    // -- draw a block for each item of data -- // 
    // draw inner blocks - each block should be a group.. 
    blockGroup = svg.selectAll('.blockGrp').data (data)

    // into the group add three blocks one for each of 
   // blockGroup.attr('transform', 'translate(0,0)')


    // put each block group at the correct x y positoin -- // 
    let spacing = 10; 


    // -- update -- 
    blockGroup
        .transition( )
        .duration(1000)
        .attr ('transform', (d, i) => { 
            const sum = data
              .slice(0, i) // Get the preceding items
              .reduce((accumulator, item) => accumulator + item.nodes.length+spacing, 0);
            const x = sum + 10;
            const y = ypos;
            return (`translate(${x}, ${y})`)
        })


    // -- enter -- // 
    blockGroup.enter ( )
        .append ('g')
        .attr('class', 'blockGrp')
        .attr ('transform', (d, i) => { 
            const sum = data
              .slice(0, i) // Get the preceding items
              .reduce((accumulator, item) => accumulator + item.nodes.length+spacing, 0);
            const x = sum + 10;
            const y = ypos;
            return (`translate(${x}, ${y})`)
        })
        .attr('groupId', (d, i) =>  i); // set groupId (for ref)


    // into each block group add a block 

    blockItems = blockGroup.selectAll('.blockItem').data (d => d.nodes_sorted)

     // -- update -- 
    blockItems
            .transition( )
            .duration(1000)
            .attr('x', function (d, i) {
                let xpos = 0; 
                // -- apply a total value to each ?? 
                if (i ==0) { 
                    d.total = d.length;
                    xpos = 0 ; 
                }

                if (i > 0) { 
                   let prev = d3.select(this.previousSibling)
                    d.total = d.length + prev.datum( ).total;
                    xpos = prev.datum( ).total ; 
                }

                return xpos; 
            })
            .attr('y', 0)
            .attr ('width', d => d.length)


    // -- enter -- 
    blockItems.enter( ) 
            .append ('rect')
            .attr ('class', 'blockItem')
            .attr('x', function (d, i) {
                let xpos = 0; 
                // -- apply a total value to each ?? 
                if (i ==0) { 
                    d.total = d.length;
                    xpos = 0 ; 
                }

                if (i > 0) { 
                   let prev = d3.select(this.previousSibling)
                    d.total = d.length + prev.datum( ).total;
                    xpos = prev.datum( ).total ; 
                }

                return xpos; 
            })
            .attr('y', 0)
            .attr ('width', d => d.length)
            .attr ('height',20)
            .attr ('fill', (d,i)  => { 
                //eturn 'red'
                // 0 = flow, 1 = paths 3 = none
                return i === 0 ?  "OrangeRed"  : i === 1 ? "Gold" : i === 2 ? "PowderBlue" : "black";
            })
            .attr('opacity', 1)
            // .on ('click', (d, i) => { 
            //     console.log ("a click", i)
            // })
            .on('click', function(dom, data) {     
                //console.log ("this is clicked ", this.getAttribute ('fill'))
                // -- get the parent of the clicked node -- 
                let parent = d3.select(this).node( ).parentNode; // the block this is in.
                let groupId = parent.getAttribute('groupId')
                let fill = this.getAttribute('fill')

                // -- only click if this is row 0  or is 




                testFunction(data, index, groupId, fill); // makers, row index, groupid 

                // if index 


            });


}


function clickBlockItem (element, data) {
        // console.log("Clicked item index:", this);
        // console.log("Clicked element:", d3.select (element));
        // console.log("Clicked data:", data);

        doSomething( );
}


function findBlockByMaker( ) { 
    // which block contain the maker 
    console.log ("find block by maker = ", block)
    block.each (function (b) { 
        console.log ('block ', b)
        console.log ('this', this)
        // get the block and 
    })
}


return (
    <g ref={svgRef} transform="translate(250, 0) scale(1.2)">
      <text ref={headingRef } style={{ fontFamily: 'sans-serif', fontSize: '16px', fontWeight: 'light', fill: 'white' }}></text>
    </g>
  );

};


export default BarsComponent;