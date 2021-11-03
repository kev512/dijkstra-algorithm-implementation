// Funkcja zwraca wierzchołek o najmniejszej odległości
// Q - zbiór (Set) wierzchołków, "kolejka priorytetowa"

// Funkcja, która szuka najkrótszego dystansu pomiędzy wierzchołkami
function vertexWithMinimumDistance(Q, dist) {
  // maksymalna odległoś, wszystko co będzie mniejsze, będzie prawdą
  let minDistance = Infinity;
  //wierzchołek wynikowy - na początku jeszcze nic nie jest znalezione
  let resultV = null;

  // przechodzenie po wszystkich wierzchołkach z Q
  for (let v of Q) {
    // dist - obiekt z najkrótszymi odległościami wyliczonymi dla wierzchołków
    // np. dist = {'a': 112, 'b': 34, ...}

    if (dist[v] < minDistance) {
      minDistance = dist[v];
      resultV = v;
    }
  }

  return resultV;
}

// Utworzenie krawędzi między wszystkimi parami wierzchołków
// oraz wyliczenie odległości między nimi ("długości krawędzi")
// Wynik:
// edges - tablica z tablicami [v,w,d], gdzie v,w to nazwy wierzchołków
function calculateEdges(vertices) {
  // na początku jest inicjalizowana na pustą
  const edges = [];

  // Dla każdej pary wierzchołków tworzymy krawędź którą dodajemy do edges
  // i - indeks 1st wierzchołka, j - 2nd wierzchołka
  // AB = BA
  for (let i = 0; i < vertices.length; ++i) {
    // idziemy od i, ponieważ nie ma potrzeby cofać się do tyłu w parze
    for (let j = i; j < vertices.length; ++j) {
      // nie można wziąć takich samych wierzchołów, BB CC DD
      if (i !== j) {
        const v1 = vertices[i];
        const v2 = vertices[j];
        const distance = Math.sqrt(
          (v2.x - v1.x) * (v2.x - v1.x) + (v2.y - v1.y) * (v2.y - v1.y)
        );
        // dodanie tablic (pary wierzchołów + odległóść) do tablicy edges
        edges.push([v1, v2, distance]);
      }
    }
  }

  return edges;
}

// Dijkstra
// edges - tablica z tablicami [v,w,d], gdzie v,w to nazwy wierzchołków
// source - tylko nazwa -> STRING, wierzchołka startowego np. 'A'
// target - tylko nazwa -> STRING, wierzchołka docelowego, do którego szukamy najkrótszej ścieżki np. 'B'
function dijkstra(edges, source, target) {
  // Q - zbiór wierzchołków, "kolejka priorytetowa"
  const Q = new Set();

  // dist - obiekt z najkrótszymi odległościami wyliczonymi dla wierzchołków
  // np. dist = {'a': 112, 'b': 34, ...}
  const dist = {};

  // adj - obiekt z informacjami o połączeniach między wierzchołkami połączonymi krawędziami
  // w zadaniu wszystkie wierzchołki są połączone krawędziami ze wszystkimi pozostałymi
  // np. adj = {'a': {'b': 10}, 'b':{'a': 10}};
  const adj = {};

  for (let i = 0; i < edges.length; ++i) {
    const edge = edges[i];

    const v1 = edge[0].name;
    const v2 = edge[1].name;
    const distance = edge[2];

    Q.add(v1);
    Q.add(v2);

    // w punkcie A, przed obliczeniami do wszystkich inny wierzhołków == nieskończoność
    dist[v1] = Infinity;
    dist[v2] = Infinity;

    // inicjowanie adj
    if (adj[v1] === undefined) {
      adj[v1] = {};
    }
    if (adj[v2] === undefined) {
      adj[v2] = {};
    }

    // ustawienie odległości z wierzchołka v1 do v2
    adj[v1][v2] = distance;
    adj[v2][v1] = distance;
  }

  dist[source] = 0;

  const prev = {};

  // już znamy odległości do wszystkich innych punktów z pkt startowego
  // Dopóki kolejka nie jest pusta...
  while (Q.size) {
    // Wybieramy wierzchołek z najmniejszą odległością,
    // czyli jest to wierzchołek o najniższym priorytecie w kolejce
    const u = vertexWithMinimumDistance(Q, dist);

    // Jeśli u jest naszym docelowym wierzchołkiem to kończymy
    if (u === target) {
      break;
    }

    // 1) Z kolejki usuwamy wierzchołek o najmniejszym priorytecie
    Q.delete(u);

    // Wybieramy wszystkie sąsiadujące wierzchołki do u
    let neighbors = Object.keys(adj[u]).filter((v) => Q.has(v));

    // 2) Dla każdego sąsiada v wierzchołka u:
    for (let v of neighbors) {
      //trasa kótrą pokonało się do tej pory + odległość do najbliższego wierzchołka
      let alt = dist[u] + adj[u][v];
      // alt = 7 + 10 > 9 = dist
      if (alt < dist[v]) {
        dist[v] = alt;
        // prev -> nazwa wierzchołka, jeśli ta odległość jest jednak mniejsza, to jednak pójdziemy drogą sprawdzoną w poprzednim kroku
        prev[v] = u;
      }
    }
  }

  let u = target;

  // S - sciezka
  // tablica wierzchoów, na początku jest ostatni pkt
  // w odwrotnej kolejności, od ostatniego do pierwszego
  let S = [u];
  // suma odległości trasy
  let d = 0;

  // Tworzymy ścieżkę
  while (prev[u] !== undefined) {
    S.unshift(prev[u]);
    d += adj[u][prev[u]];
    u = prev[u];
  }

  return [S, d];
}

// dla każdego wierzchołka funckja liczy wszystkie najkrótsze ścieżki
// dodwanie odległości po kolei
function hamiltonCycle(vertices, source) {
  const edges = calculateEdges(vertices);

  const visited = [source];
  const distances = [0];

  let current = source;
  while (true) {
    const paths = [];

    for (let v of vertices) {
      const target = v.name;
      const wasVisited = visited.findIndex((n) => n === target) >= 0;
      if (current !== target && !wasVisited) {
        // wynik dijkstry = ścieżka + odległość
        let [path, length] = dijkstra(edges, current, target);
        paths.push([path, length]);
      }
    }

    if (paths.length > 0) {
      paths.sort((p1, p2) => {
        const length1 = p1[1];
        const length2 = p2[1];
        return length1 - length2;
      });

      const path = paths[0][0];
      const length = paths[0][1];

      const u = path[path.length - 1];
      visited.push(u);
      distances.push(length);

      current = u;
    } else {
      const last = visited[visited.length - 1];

      // Dodawanie "powrotu" do pierwszego wierzchołka z ostatniego
      const edge = edges.find((e) => {
        const v1 = e[0];
        const v2 = e[1];
        return v1.name === source && v2.name === last;
      });

      visited.push(visited[0]);
      distances.push(edge[2]);

      return [visited, distances];
    }
  }
}
