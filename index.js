// Pour récupérer les bougies M1
const getData = async () => {
  const res = await fetch('mydatafullbiennCUT.csv');
  if (!res.ok) {
    console.error('Error loading M1.csv');
    return;
  }

  const resp = await res.text();
  const cdata = resp.split('\n').map((row) => {
    const [time1, time2, open, high, low, close] = row.split(',');
    const date = new Date(`${time1}, ${time2}`);
    date.setHours(date.getHours() + 2); // Ajoute 2 heures à la date
    const timestamp = date.getTime() / 1000;
    return {
      time: timestamp,
      // On multiplie par 100 pour que l'axe y soit précis
      open: open * 100,
      high: high * 100,
      low: low * 100,
      close: close * 100,
    };
  });
  return cdata;
};

getData().then((data) => {
  console.log(data);
});

// Pour récupérer la liste des positions
const getPosition = async () => {
  const res = await fetch('positions_2_2CUT.csv');
  if (!res.ok) {
    console.error('Error loading positions.csv');
    return;
  }

  const resp = await res.text();
  // Diviser le CSV en lignes
  const lines = resp.split('\n');
  // Initialiser un tableau pour stocker les éléments de chaque ligne
  const positions = [];
  
  // Parcourir chaque ligne et extraire les éléments
  for (const line of lines) {
    const parts = line.split(',');
    if (parts.length >= 8) { // Assurez-vous qu'il y a au moins 8 éléments
      positions.push(parts.slice(0, 8)); // Ajoutez les 8 premiers éléments
    }
  }
  
  return positions;
}

getPosition().then((data) => {
  console.log(data);
});


const displayChart = async () => {

  // Propriétés du chart
  const chartProperties = {
    width: 1700,
    height: 800,
    backgroundColor : 'gray',
    timeScale: {
      timeVisible: true,
      secondsVisible: true,
    },
    // Activer la barre de défilement temporel
    handleScroll: {
      // Configuration de la barre de défilement
      horizVisible: true, // Afficher la barre de défilement horizontale
      horizSize: 16, // Largeur de la barre de défilement
      horizBarVisible: true, // Afficher la poignée de défilement
    },
  };

  const domElement = document.getElementById('tvchart');
  const chart = LightweightCharts.createChart(domElement, chartProperties);
  const candleseries = chart.addCandlestickSeries();

  // Get the data of the candlesticks
  const klinedata = await getData();
  candleseries.setData(klinedata);

  // Get the data of the positions
  const tabPositions = await getPosition();
  
  // Personnalisation des bougies
  candleseries.applyOptions({
    downColor: 'black', // Couleur des bougies rouges
    borderDownColor: 'black', // Couleur de la bordure des bougies rouges
    wickDownColor: 'black', // Couleur de la mèche des bougies rouges
    borderDownWidth: 1, // Largeur de la bordure des bougies rouges
    drawBorder: true, // Activer la bordure
    upColor: 'blue',
    borderUpColor: 'blue', // Couleur de la bordure des bougies vertes
    wickUpColor: 'yellow', // Couleur de la mèche des bougies vertes
    borderUpWidth: 1, // Largeur de la bordure des bougies vertes
    showPriceLine: false, // Désactiver la ligne de prix à côté des bougies
  });

  // Initialisation d'un tableau pour stocker les markers
  const markers = [];

  // Dessin de chaque position
  for (const position of tabPositions) {
    date = new Date(position[0]);
    date.setHours(date.getHours() + 2); // Ajoute 2 heures à la date
    const dateStamp = date.getTime() / 1000;
    ordre = position[1]*100
    nature = position[2]
    bas_range = position[3]*100
    haut_range = position[4]*100
    resultat = position[7]

    // const timezoneOffsetMinutes = targetDate.getTimezoneOffset();
    // targetDate.setMinutes(targetDate.getMinutes() - timezoneOffsetMinutes);
  
    const targetCandle = klinedata.find(candle => candle.time === dateStamp);
  
    if (targetCandle) {
      //const priceScale = chart.priceScale();
      // On a un buy
      if (nature == '1.0'){
        // TP
        if (resultat=='1.0'){
          // Ajout d'un marker sur la bougie cible
          markers.push({
            time: targetCandle.time,
            position: 'belowBar',
            shape: 'arrowUp',
            color: 'green', // Couleur du marker
            size: 3, // Taille du marker
            text: "Ordre : " + ordre +"\nBas range : " + bas_range + "\nHaut range : "+ haut_range,
            //y: priceScale.priceToCoordinate(ordre),
            //price: ordre,
          });
        }
        // SL
        else if (resultat=='0.0'){
          // Ajout d'un marker sur la bougie cible
          markers.push({
            time: targetCandle.time,
            position: 'belowBar',
            shape: 'arrowUp',
            color: 'red', // Couleur du marker
            size: 3, // Taille du marker
            text: "Ordre : " + ordre +"\nBas range : " + bas_range + "\nHaut range : "+ haut_range,
          });
        }
        // ND
        else if (resultat=='2.0'){
          // Ajout d'un marker sur la bougie cible
          markers.push({
            time: targetCandle.time,
            position: 'belowBar',
            shape: 'arrowUp',
            color: 'gray', // Couleur du marker
            size: 3, // Taille du marker
            text: "Ordre : " + ordre +"\nBas range : " + bas_range + "\nHaut range : "+ haut_range,
          });
        }

      } 
      // On a un sell
      else if (nature == '0.0'){

        // TP
        if (resultat=='1.0'){
          // Ajout d'un marker sur la bougie cible
          markers.push({
            time: targetCandle.time,
            position: 'aboveBar',
            shape: 'arrowDown',
            color: 'green', // Couleur du marker
            size: 3, // Taille du marker
            text: "Ordre : " + ordre +"\nBas range : " + bas_range + "\nHaut range : "+ haut_range,
          });
        }
        // SL
        else if (resultat == '0.0'){
          // Ajout d'un marker sur la bougie cible
          markers.push({
            time: targetCandle.time,
            position: 'aboveBar',
            shape: 'arrowDown',
            color: 'red', // Couleur du marker
            size: 3, // Taille du marker
            text: "Ordre : " + ordre +"\nBas range : " + bas_range + "\nHaut range : "+ haut_range,
          });
        }
        // ND
        else if (resultat == '2.0'){
          // Ajout d'un marker sur la bougie cible
          markers.push({
            time: targetCandle.time,
            position: 'aboveBar',
            shape: 'arrowDown',
            color: 'gray', // Couleur du marker
            size: 3, // Taille du marker
            text: "Ordre : " + ordre +"\nBas range : " + bas_range + "\nHaut range : "+ haut_range,
          });
        }

      }

    }
  }
  
  // Ajout de tous les marqueurs à candleseries
  candleseries.setMarkers(markers);


};

displayChart();

// Commment faire ?
// (base) nico@nico-MS-7C87:~/Documents/Project-Trading/chart_web/pageweb$ python -m http.server
// Puis localhost:8000 sur firefox

//TODO: Mettre les positions !