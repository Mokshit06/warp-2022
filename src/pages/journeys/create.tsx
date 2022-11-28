import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
} from '@chakra-ui/react';
import { Feature, Geometry, GeoJsonProperties } from 'geojson';
import mapboxgl, { Map } from 'mapbox-gl';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { geocodeLocation, getDirections } from '../../utils/mapbox';
import { trpc } from '../../utils/trpc';

export default function CreateJourney() {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const createJourney = trpc.journey.createJourney.useMutation();
  const mapRef = useRef<Map>();
  const [loading, setLoading] = useState(false);
  const [plotted, setPlotted] = useState(false);

  useEffect(() => {
    console.log('CREATING');
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

    return () => {
      map.remove();
      mapRef.current = undefined;
    };
  }, []);

  return (
    <Flex flex={1} width="full" alignItems="center" justifyContent="center">
      <Box>
        <Heading fontSize="4xl" mb="4">
          Start your journey!
        </Heading>
        <Box
          borderWidth={1}
          minW="500px"
          px={6}
          pt={4}
          pb={5}
          width="full"
          rounded="lg"
          bg="blackAlpha.300"
          border="2px solid var(--chakra-colors-gray-700)"
          textAlign="center"
          // boxShadow="lg"
        >
          <Flex
            as="form"
            gap="4"
            minW="800px"
            align="flex-end"
            ref={formRef as any}
            onSubmit={async e => {
              e.preventDefault();
              setLoading(true);
              const formData = new FormData(formRef.current!);

              const map = mapRef.current;

              if (!map) return;

              try {
                const origin = await geocodeLocation(
                  formData.get('origin') as string
                );
                const destination = await geocodeLocation(
                  formData.get('destination') as string
                );

                map.fitBounds(
                  [
                    new mapboxgl.LngLat(...origin),
                    new mapboxgl.LngLat(...destination),
                  ],
                  { bearing: 0, pitch: 0, padding: 100 }
                );

                const directionsData = await getDirections(origin, destination);

                const route = directionsData.routes[0];
                const directions = route.legs[0].steps.map((step: any) => {
                  return {
                    instruction: step.maneuver.instruction,
                    modifier: step.maneuver.modifier,
                  };
                });

                const geojson: Feature<Geometry, GeoJsonProperties> = {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'LineString',
                    coordinates: route.geometry.coordinates,
                  },
                };

                setLoading(false);

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
                setPlotted(true);
              } catch {
                setLoading(false);
              }
            }}
          >
            {/* <CreateClassForm setOpen={onOpen} setCode={setCode} /> */}
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input name="name" placeholder="Enter name" required />
            </FormControl>
            <FormControl>
              <FormLabel>From</FormLabel>
              <Input name="origin" placeholder="Enter origin" required />
            </FormControl>
            <FormControl>
              <FormLabel>To</FormLabel>
              <Input
                name="destination"
                placeholder="Enter destination"
                required
              />
            </FormControl>
            {!plotted ? (
              <Button isLoading={loading} type="submit" size="lg" px="9">
                Start
              </Button>
            ) : (
              <Button
                type="button"
                size="lg"
                px="9"
                onClick={async () => {
                  const formData = new FormData(formRef.current!);

                  const journey = await createJourney.mutateAsync({
                    from: formData.get('origin') as string,
                    to: formData.get('destination') as string,
                    name: formData.get('name') as string,
                  });

                  router.push(`/journeys/${journey.id}`);
                }}
              >
                Continue
              </Button>
            )}
          </Flex>
          <Box mt="4" pos="relative" w="full" height="60vh" rounded="lg">
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
        </Box>
      </Box>
    </Flex>
  );
}
