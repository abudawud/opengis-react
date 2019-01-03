import React, { Component } from 'react';
import { Navbar, Nav, NavItem, Checkbox} from 'react-bootstrap';
import { Map, TileLayer, Popup, GeoJSON } from 'react-leaflet'
import './App.css';

//TODO: Move to component
function PopupProps(props){
  const propers = Object.keys(props.data).map((ind, el) => <div key={el}><b>{ind}</b>: {props.data[ind]} </div> );
  console.log(props.data);

  return(
    <div>
      <div className="text-center text-primary"><b>{props.data['Ibu Kota']}</b></div>
      {propers}
    </div>
  )
}


class App extends Component {
  END_POINT = "http://192.168.254.21:80";
  compState = false;

  mapVal = {
    lat: 113.30,
    lng:  -8.30,
    zoom: 13,
  };

  constructor(){
    super();
    this.state = {marker: {}, polygon: {}, xstate: []};
    this.region = false;
  }

  componentDidMount(){
    console.log("FETCH CHECK");
    fetch(`${this.END_POINT}/region/`)
      .then(resposnse => resposnse.json())
      .then(results => this.setState({regions: results}));

    fetch(`${this.END_POINT}/place/`)
      .then(resposnse => resposnse.json())
      .then(results => this.setState({places: results}));
  }

  regionChange(val, e){
    const key = val.name;
    if(this.state.polygon[val.name] === undefined){
      console.log("FETCH");
      fetch(`${this.END_POINT}/polygon/${val.name}`)
        .then(resposnse => resposnse.json())
        .then(results => this.cacheRegion(val.name, results));
    }else{
      const state = e.target.checked;
      this.setState(prev => ({
        polygon:{
          ...prev.polygon, [key]: {draw: state, gson: prev.polygon[key].gson}
        }
      })
      );
    }
  }

  cacheRegion(key, poly){
    var state = this.state.polygon;
    state[key] = {gson: poly};
    state[key]['draw'] = true;

    this.setState({polygon: state});
  }

  renderRegions(){

    if(this.state.regions === undefined){
      return (
        <h3>Loading...</h3>
      )
    }else{
      const regComponent = this.state.regions.kota_kab.map( (val) =>
        <ul key={val.id} className="list-parent">
          <Checkbox onChange={(e) => this.regionChange(val, e)}>{val.name} </Checkbox>
        </ul>
      );

      return(
        <li className="list">
          {regComponent}
        </li>
      );

    }
  }

  placeChange(val, e){
    const repVal = val.jenis_fitur.replace(' ', '_');

    if(this.state.marker[repVal] === undefined){
      console.log("FETCH");
      fetch(`${this.END_POINT}/markers/${repVal}`)
        .then(resposnse => resposnse.json())
        .then(results => this.cachePlace(repVal, results));
    }else{
      const state = e.target.checked;
      this.setState(prev => ({
        marker:{
          ...prev.marker, [repVal]: {draw: state, gson: prev.marker[repVal].gson}
        }
      })
      );
    }
  }

  cachePlace(key, poly){
    var state = this.state.marker;
    state[key] = {gson: poly};
    state[key]['draw'] = true;

    this.setState({marker: state});
  }

  renderPlace(){
    if(this.state.places === undefined){
      return (
        <h3>Loading...</h3>
      )
    }else{
      const regComponent = this.state.places.places.map( (val) =>
        <ul key={val.id} className="list-parent">
          <Checkbox onChange={(e) => this.placeChange(val, e)}>{val.jenis_fitur} </Checkbox>
        </ul>
      );

      return(
        <li className="list">
          {regComponent}
        </li>
      );

    }
  }

  createPopup(props){
    const popup = Object.keys(props).map((val) => `<div><b>${val}:</b> ${props[val]}</div>`).join('\n');
    return (
      `<div>
        <div class="text-center text-primary"><b>${props['Nama Instansi']}</b></div>
        ${popup}
      </div>`
    );
  }

  renderMarker(){
    const marker = this.state.marker;

    const componentMarker = [];
    Object.keys(marker).forEach((val,i) => {
      console.log(i);
      if(marker[val].draw){
        componentMarker.push(
          <GeoJSON key={i} data={marker[val].gson} onEachFeature={(f, l) => l.bindPopup(this.createPopup(f.properties))}>
          </GeoJSON>
        );
      }
    });

    return (componentMarker);
  }

  renderPolygon(){
    const polygon = this.state.polygon;

    const componentPolygon = [];
    Object.keys(polygon).forEach((val,i) => {
      if(polygon[val].draw){
        componentPolygon.push(
          <GeoJSON key={i} data={polygon[val].gson}>
            <Popup>

                  <PopupProps data={polygon[val].gson.properties} />
            </Popup>
          </GeoJSON>
        );
      }
    });

    return (componentPolygon);
  }

  refreshMComp(){
    const datastate = this.state;

    const geocomponent = [];

    Object.keys(datastate).map((e,i,arr) => {
      if(datastate[e].draw)
        geocomponent.push(
          <GeoJSON key={i} data={datastate[e].data}>
            <Popup>

                  <PopupProps data={datastate[e].data.properties} />
            </Popup>
          </GeoJSON>
        );
    });

    if(geocomponent.length > 0){
      console.log("DRAW");
      return(
        geocomponent
      )
    }
  }

  render() {
    return (
      <div>
      <Navbar fluid fixedTop collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="#brand">SISTEM INFORMASI GEOGRAFIS</a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav pullRight>
            <NavItem eventKey={1} href="https://react-bootstrap.github.io/">
              Make with Love using ReactJS & Bootstrap
            </NavItem>
            <NavItem eventKey={1} href="#">
              Login
            </NavItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <div className="mysidebar">
        <div className="region-sel">
          {this.renderRegions()}
        </div>

        <div className="instansi-sel">
            {this.renderPlace()}
        </div>
      </div>

        <div className="maps-c">
        <Map center={[-8.38,113.35]} zoom="8">
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {this.renderPolygon()}
          {this.renderMarker()}
        </Map>
        </div>

      </div>
    );
  }

}

export default App;
