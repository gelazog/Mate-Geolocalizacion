export const distanceLimits = [
    { value: 1, label: '1 km' },
    { value: 3, label: '3 km' },
    { value: 5, label: '5 km' },
    { value: null, label: 'Todas las paradas' },
  ];
  
  export const routesData = {
    routes: [
      {
        id: "route1",
        name: "Ruta Florido",
        stops: [
          { id: "stop1", name: "Parada Florido - Av. Florido", latitude: 32.5200, longitude: -117.0450 },
          { id: "stop2", name: "Parada UTT - Campus UTT", latitude: 32.5250, longitude: -117.0480 },
          { id: "stop3", name: "Parada Florido - Centro de Atención", latitude: 32.5210, longitude: -117.0440 },
          { id: "stop4", name: "Parada Florido - Terminal", latitude: 32.5220, longitude: -117.0430 },
        ],
      },
      {
        id: "route2",
        name: "Ruta Morita",
        stops: [
          { id: "stop5", name: "Parada Morita - Av. Morita", latitude: 32.5170, longitude: -117.0410 },
          { id: "stop6", name: "Parada Morita - Calimax Las Abejas", latitude: 32.5165, longitude: -117.0405 },
          { id: "stop7", name: "Parada Morita - Esquina Morita", latitude: 32.5180, longitude: -117.0400 },
          { id: "stop8", name: "Parada Morita - Centro Comercial", latitude: 32.5190, longitude: -117.0390 },
        ],
      },
      {
        id: "route3",
        name: "Ruta Centro/Otay",
        stops: [
          { id: "stop9", name: "Parada Centro - Plaza Constitución", latitude: 32.5149, longitude: -117.0382 },
          { id: "stop10", name: "Parada Centro - Av. Revolución", latitude: 32.5135, longitude: -117.0370 },
          { id: "stop11", name: "Parada Otay - Terminal Otay", latitude: 32.5110, longitude: -117.0350 },
          { id: "stop12", name: "Parada Centro - Otra Parada", latitude: 32.5150, longitude: -117.0360 },
        ],
      },
    ],
  };