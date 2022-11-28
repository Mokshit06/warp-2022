import { Avatar, Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
import { Feature, GeoJsonProperties, Geometry } from 'geojson';
import mapboxgl, { Map } from 'mapbox-gl';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { geocodeLocation, getDirections } from '../../../utils/mapbox';
import { trpc } from '../../../utils/trpc';

export default function SingleJourney() {
  const router = useRouter();
  const session = trpc.auth.getSession.useQuery();
  const journey = trpc.journey.getJourney.useQuery(
    { id: router.query.id as string },
    { enabled: !!router.query.id }
  );

  if (!session.data?.user || !journey.data) return null;

  return (
    <Flex
      flex={1}
      p="4"
      gap="3"
      // justifyContent="center"
      // alignItems="center"
      position="relative"
    >
      <Box h="full" bg="blackAlpha.300" p="4" rounded="lg" w="400px">
        <Box
          as="img"
          src={journey.data?.image}
          rounded="md"
          w="full"
          objectFit="cover"
          objectPosition="center"
          h="350px"
        />
        <Box mt="4">
          <Heading>{journey.data.name}</Heading>
          <Box mt="3">
            <Text color="gray.300" fontSize="lg">
              From: {journey.data.from}
            </Text>
            <Text color="gray.300" fontSize="lg">
              Destination: {journey.data.to}
            </Text>
          </Box>
          <Box mt="3">
            <Text color="gray.300" fontSize="lg">
              Climbers: {journey.data.climbers.length}
            </Text>
            <Text color="gray.300" fontSize="lg">
              Destination: 170min
            </Text>
            <Text color="gray.300" fontSize="lg">
              Suggestions: {journey.data.suggestions.length}
            </Text>
          </Box>
        </Box>
      </Box>
      <Box flex={1}>
        <Mapbox origin={journey.data.from} destination={journey.data.to} />
        <Button
          mt="5"
          w="full"
          size="lg"
          onClick={() => {
            router.push(`/journeys/${router.query.id}/chat`);
          }}
        >
          Connect with the climbers
        </Button>
      </Box>
    </Flex>
  );
}

function Mapbox(props: { origin: string; destination: string }) {
  const mapRef = useRef<Map>();
  const markPath = async () => {
    const map = mapRef.current;

    if (!map) return;

    const origin = await geocodeLocation(props.origin);
    const destination = await geocodeLocation(props.destination);

    map.fitBounds(
      [new mapboxgl.LngLat(...origin), new mapboxgl.LngLat(...destination)],
      { bearing: 0, pitch: 0, padding: 100 }
    );

    const directionsData = await getDirections(origin, destination);
    const route = directionsData.routes[0];

    const geojson: Feature<Geometry, GeoJsonProperties> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: route.geometry.coordinates,
      },
    };

    if (map.getSource('route')) {
      (map.getSource('route') as any).setData(geojson);
    } else {
      map.addLayer({
        id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          data: geojson,
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#066adb',
          'line-width': 12,
          'line-opacity': 0.75,
        },
      });
    }
  };

  useEffect(() => {
    const map = new mapboxgl.Map({
      style: 'mapbox://styles/mapbox/satellite-v9',
      // manali coords
      center: [77.1892, 32.2432],
      zoom: 15.5,
      pitch: 45,
      // bearing:17.6,
      container: 'map',
      antialias: true,
    });

    mapRef.current = map;

    markPath();

    return () => {
      // map.remove();
      mapRef.current = undefined;
    };
  }, []);

  return (
    <Box pos="relative" w="full" height="70vh" rounded="lg">
      <Box
        rounded="lg"
        id="map"
        left="0"
        right="0"
        top="0"
        bottom="0"
        pos="absolute"
      />
    </Box>
  );
}
