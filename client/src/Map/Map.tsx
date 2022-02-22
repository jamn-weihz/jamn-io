import { gql, useLazyQuery, useReactiveVar } from '@apollo/client';
import { Box, Card } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { userVar } from '../cache';
import MapControls from './MapControls';
//@ts-ignore
import mapboxgl from '!mapbox-gl'; //eslint-disable-line import/no-webpack-loader-syntax
import { Map as MapBoxMap } from 'mapbox-gl';
import useUpdateUser from '../User/useUpdateUser';
import { DEFAULT_COLOR, DEV_SERVER_URI, MAPBOX_ACCESS_TOKEN } from '../constants';
import { Jam } from '../types/Jam';
import StartJamModal from './StartJamModal';
import { useNavigate } from 'react-router-dom';

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

const GET_JAMS_BY_LOCATION = gql`
  query GetJamsByLocation($lng: Float!, $lat: Float!, $zoom: Float!) {
    getJamsByLocation(lng: $lng, lat: $lat, zoom: $zoom) {
      id
      name
      lng
      lat
    }
  }
`;

export default function Map() {
  const navigate = useNavigate();

  const userDetail = useReactiveVar(userVar);

  const mapContainer = useRef(null);
  const map = useRef(null as unknown as MapBoxMap);

  const [marker, setMarker] = useState(null as any | null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSourceAdded, setIsSourceAdded] = useState(false);

  const [lng, setLng] = useState(userDetail.user?.mapLng || -118.5301);
  const [lat, setLat] = useState(userDetail.user?.mapLat || 34.2381);
  const [zoom, setZoom] = useState(userDetail.user?.mapZoom || 4);

  const [pinLng, setPinLng] = useState(lng);
  const [pinLat, setPinLat] = useState(lat);
  const [hasPin, setHasPin] = useState(false);

  const [jams, setJams] = useState([] as Jam[]);
  const [selectedJam, setSelectedJam] = useState(null as Jam | null);
  const [isStartingJam, setIsStartingJam] = useState(false);

  const [updateUserTimeout, setUpdateUserTimeout] = useState(null as ReturnType<typeof setTimeout> | null);

  const { updateUserMap } = useUpdateUser();

  const [getJamsByLocation] = useLazyQuery(GET_JAMS_BY_LOCATION, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      setJams(data.getJamsByLocation);
    }
  });

  const handlePinClick = (m:any) => (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    m.remove();
    setHasPin(false);
  };

  const handleMapClick = (m:any) => (event: mapboxgl.MapMouseEvent) => {
    const features = map.current.queryRenderedFeatures(event.point)
      .filter(feature => feature.source === 'points' || feature.source === 'clusters')
   
    if (features.length === 0) {
      const { lng, lat } = event.lngLat;
      
      m.setLngLat([lng, lat]).addTo(map.current);

      setPinLng(lng);
      setPinLat(lat);
      setHasPin(true);
    }
  }

  useEffect(() => {
    getJamsByLocation({
      variables: {
        lng,
        lat,
        zoom,
      }
    });

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [
        lng,
        lat,
      ],
      zoom: zoom,
    }) as MapBoxMap;

    const m = new mapboxgl.Marker({
      color: userDetail.user?.color || DEFAULT_COLOR,
      draggable: true,
    });

    m.getElement().addEventListener('click', handlePinClick(m))
    
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: false,
        showUserLocation: false,
        showUserHeading: false,
        showAccuracyCircle: false,
      })
    )

    map.current.on('load', () => {
      const uri = process.env.NODE_ENV === 'production'
        ? '/favicon.ico'
        : `${DEV_SERVER_URI}/favicon.ico`;

      map.current.loadImage(uri, (error, image) => {
        if (error) throw error;
        map.current.addImage('custom-marker', image as any);
      });
      setIsLoaded(true);
    });

    map.current.on('move', () => {
      const { lng, lat } = map.current.getCenter();
      const zoom = map.current.getZoom()
      setLng(lng);
      setLat(lat);
      setZoom(zoom);
    });

    map.current.on('click', handleMapClick(m));
  }, []);

  useEffect(() => {
    if (!map.current.loaded()) return;
    if (isSourceAdded) {
      map.current.removeLayer('cluster-counts');
      map.current.removeLayer('clusters');
      map.current.removeLayer('points');
      map.current.removeSource('points');
    }
    map.current.addSource('points', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: jams.map(jam => {
          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [
                jam.lng,
                jam.lat,
              ],
            },
            properties: {
              name: jam.name,
              jam: jam,
            }
          };
        }),
      },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 70,
    });
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'points',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#f4900c',
        'circle-radius': 25,
      }
    });
    map.current.addLayer({
      id: 'cluster-counts',
      type: 'symbol',
      source: 'points',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 20,
      },
      paint: {
        'text-color': '#FFFFFF'
      }
    });
    map.current.addLayer({
      id: 'points',
      type: 'symbol',
      source: 'points',
      filter: ['!', ['has', 'point_count']],
      layout: {
        'icon-image': 'custom-marker',
        'text-field': ['get', 'name'],
        'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
        'text-offset': [0, 1.5],
        'text-anchor': 'top'
      }
    });

    map.current.on('click', 'clusters', (event) => {
      const features = map.current.queryRenderedFeatures(event.point, {
        layers: ['clusters'],
      });
      const clusterId = features[0].properties?.cluster_id;
      (map.current.getSource('points') as any).getClusterExpansionZoom(
        clusterId,
        (err: any, zoom: any) => {
          if (err) return;
          map.current.easeTo({
            center: (features[0].geometry as any).coordinates,
            zoom,
          })
        }
      )
    });
    map.current.on('click', 'points', (event) => {
      const features = event.features as any[];
      const jam = JSON.parse(features[0].properties?.jam) as Jam;
      navigate(`/j/${encodeURIComponent(jam.name)}`);
    });
    map.current.on('mouseenter', 'clusters', () => {
      map.current.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'clusters', () => {
      map.current.getCanvas().style.cursor = '';
    });
    map.current.on('mouseenter', 'points', () => {
      map.current.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'points', () => {
      map.current.getCanvas().style.cursor = '';
    });

  }, [jams, isLoaded]);

  useEffect(() => {
    if (updateUserTimeout) {
      clearTimeout(updateUserTimeout);
    }
    const t = setTimeout(() => {
      updateUserMap(lng, lat, zoom);
      setUpdateUserTimeout(null);
    }, 500);
    setUpdateUserTimeout(t);
  }, [lng, lat, zoom]);

  useEffect(() => {
    if (userDetail.user?.mapLng && userDetail.user?.mapLat && userDetail.user?.mapZoom) {
      map.current?.setCenter({
        lng: userDetail.user.mapLng,
        lat: userDetail.user.mapLat,
      });
      map.current?.setZoom(userDetail.user.mapZoom);
    }
  }, [userDetail.user?.id]);

  useEffect(() => {
    if (marker) {
      marker.remove();
    }
    const m = new mapboxgl.Marker({
      color: userDetail.user?.color || DEFAULT_COLOR,
      draggable: true,
    });

    m.setLngLat([pinLng, pinLat]);
    m.getElement().addEventListener('click', handlePinClick(m));
    map.current.on('click', handleMapClick(m));
    setMarker(m);
  }, [userDetail.user?.color]);
  
  return (
    <Box sx={{
      width: '100%',
      height: '100%',
    }}>
      <Box sx={{
        position: 'absolute', top: 0, zIndex: 10,
        textAlign: 'left',
        margin: 1,
      }}>
        <Card sx={{backgroundColor: 'black', color: 'white', opacity: 0.5, padding: 1}}>
          Lng: {hasPin ? pinLng.toFixed(4) : lng.toFixed(4)}
          <br/>
          Lat: {hasPin ? pinLat.toFixed(4) : lat.toFixed(4)}
          <br/>
          Zoom: {zoom.toFixed(2)}
        </Card>
      </Box>
      
      <Box ref={mapContainer} sx={{
        width: '100%', 
        height: '100%',
      }}/>
      {
        hasPin
          ? <MapControls setIsStartingJam={setIsStartingJam}/>
          : null
      }
      <StartJamModal 
        lng={pinLng}
        lat={pinLat}
        isOpen={isStartingJam} 
        setIsOpen={setIsStartingJam}
      />
    </Box>
  )
}