
&lt;script src="make_graph.js"&gt;&lt;/script&gt;
&lt;script&gt;
    var graph = {
        "directed": true,
        "nodes": [
            {
                "id": "A",
                "y": 0.8
            },
            {
                "id": "B",
                "x": 0.2
            },
            {
                "id": "Z"
            }
        ],
        "links": [
            {
                "weight": "",
                "weight_source": 100,
                "source": "A",
                "target": "B"
            },
            {
                "weight": 33,
                "source": "A",
                "target": "A"
            },
            {
                "weight": 56,
                "weight_target": 300,
                "source": "A",
                "target": "Z"
            },
            {
                "weight": 1,
                "source": "B",
                "target": "Z"
            }
        ]
    };


    var graphs = [graph];
    make_graph(graphs, "main", true);
&lt;/script&gt;

