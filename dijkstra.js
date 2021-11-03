// Funkcja, która szuka najkrótszego dystansu pomiędzy wierzchołkami
function vertexWithMinimumDistance(Q, dist) {
  let minDistance = Infinity;
  let resultV = null;

  for (let v of Q) {
    if (dist[v] < minDistance) {
      minDistance = dist[v];
      resultV = v;
    }
  }

  return resultV;
}

// Utworzenie krawędzi między wszystkimi parami wierzchołków
// oraz wyliczenie odległości między nimi ("długości krawędzi")
function calculateEdges(vertices) {
  const edges = [];

  for (let i = 0; i < vertices.length; ++i) {
    for (let j = i; j < vertices.length; ++j) {
      if (i !== j) {
        const v1 = vertices[i];
        const v2 = vertices[j];
        const distance = Math.sqrt(
          (v2.x - v1.x) * (v2.x - v1.x) + (v2.y - v1.y) * (v2.y - v1.y)
        );
        edges.push([v1, v2, distance]);
      }
    }
  }

  return edges;
}

function dijkstra(edges, source, target) {
  const Q = new Set();

  // dist - obiekt z najkrótszymi odległościami wyliczonymi dla wierzchołków
  const dist = {};
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

  while (Q.size) {
    const u = vertexWithMinimumDistance(Q, dist);

    if (u === target) {
      break;
    }

    Q.delete(u);

    let neighbors = Object.keys(adj[u]).filter((v) => Q.has(v));

    for (let v of neighbors) {
      let alt = dist[u] + adj[u][v];
      if (alt < dist[v]) {
        dist[v] = alt;
        prev[v] = u;
      }
    }
  }

  let u = target;

  let S = [u];
  let d = 0;

  while (prev[u] !== undefined) {
    S.unshift(prev[u]);
    d += adj[u][prev[u]];
    u = prev[u];
  }

  return [S, d];
}

// dla każdego wierzchołka funckja liczy wszystkie najkrótsze ścieżki
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
