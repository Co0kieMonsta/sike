"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";
const GeoJSONMap = dynamic(() => import("./geo-json"), { ssr: false });
const BasicMap = dynamic(() => import("./basic-map"), { ssr: false });
const PopupMarkerMap = dynamic(() => import("./popup-marker-map"), { ssr: false });
const LocationMarkerMap = dynamic(() => import("./location-marker-map"), { ssr: false });
const VectorLayersMap = dynamic(() => import("./vector-layers"), { ssr: false });
const LayerGroupMap = dynamic(() => import("./layer-groups"), { ssr: false });
const SVGMap = dynamic(() => import("./svg-map"), { ssr: false });
import "leaflet/dist/leaflet.css"
const MapReactLeaflet = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Basic Leaflet Map</CardTitle>
                </CardHeader>
                <CardContent>
                    <BasicMap />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Popup with Marker</CardTitle>
                </CardHeader>
                <CardContent>
                    <PopupMarkerMap />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Location Marker Map</CardTitle>
                </CardHeader>
                <CardContent>
                    <LocationMarkerMap />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Vector Layers Map</CardTitle>
                </CardHeader>
                <CardContent>
                    <VectorLayersMap />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Layer Groups and Layers Control</CardTitle>
                </CardHeader>
                <CardContent>
                    <LayerGroupMap />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>SVG Overlay</CardTitle>
                </CardHeader>
                <CardContent>
                    <SVGMap />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Gio JSON  Map</CardTitle>
                </CardHeader>
                <CardContent>
                    <GeoJSONMap />
                </CardContent>
            </Card>
        </div>
    );
};

export default MapReactLeaflet;
