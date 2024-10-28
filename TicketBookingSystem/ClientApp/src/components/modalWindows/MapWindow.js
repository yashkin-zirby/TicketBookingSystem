import React, { Component } from 'react';
import SessionManager from '../services/SessionManager';
import { ModalWindow } from './ModalWindow';
import "./styles.css";

export class MapWindow extends Component {
    static displayName = MapWindow.name;
    static modalName = "MapWindow";
    constructor(props) {
        super(props);
        this.defaultState = () => {
            return {
                placeId: null,
                closed: true
            };
        };
        this.googlePlaces = null;
        this.state = this.defaultState();
        this.onOpenCloseWindow = this.onOpenCloseWindow.bind(this);
    }
    onOpenCloseWindow(data) {
        if (data != null) {
            this.setState({
                placeId: data,
                closed: false,
            }, () => {
                let map = new window.google.maps.Map(document.getElementById("map"), {
                    center: {
                        lat: 53.90125379949768,
                        lng: 27.560415112492525
                    },
                    zoom: 16,
                });
                let infoWindow = new window.google.maps.InfoWindow();
                var service = new window.google.maps.places.PlacesService(map);
                service.getDetails({
                    placeId: this.state.placeId
                }, function (result, status) {
                    if (status != window.google.maps.places.PlacesServiceStatus.OK) {
                        alert(status);
                        return;
                    }
                    var marker = new window.google.maps.Marker({
                        map: map,
                        place: {
                            placeId: result.place_id,
                            location: result.geometry.location
                        }
                    });
                    map.setCenter(result.geometry.location);
                    var address = result.adr_address;
                    var newAddr = address.split("</span>,");

                    infoWindow.setContent(result.name + "<br>" + newAddr[0] + "<br>" + newAddr[1] + "<br>" + newAddr[2]);
                    window.google.maps.event.addListener(infoWindow, 'domready', function () {
                        map.setCenter(marker.getPosition());
                    });
                    infoWindow.open(map, marker);

                });
            });
        } else {
            this.setState(this.defaultState());
        }
    }
    render() {
        return (
            <ModalWindow title="Место проведения концерта" closed={this.state.closed} modalName={MapWindow.modalName} dataChanged={this.onOpenCloseWindow}>
                <div id="map" style={{ width: "100%", height: "100%", minHeight:"400px" }} ></div>
            </ModalWindow>
        );
    }
}