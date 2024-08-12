function make_graph(graphs, container = "body", edit_mode = false) {
    const SELECT = container;
    const main = document.querySelector(SELECT);
    const main_rect = main.getBoundingClientRect();
    const nodes_width_min = 400;
    const nodes_height_min = 400;
    const nodes_width = Math.max(main_rect["width"], nodes_width_min);
    const nodes_height = Math.max(main_rect["height"], nodes_height_min);
    const FILENAME = "graphs"
    const BCOLOR = main.style["background-color"] ? main.style["background-color"] : "white";
    const COLOR = main.style["color"] ? main.style["color"] : "black";
    const LABELS = { 0.5: "weight", 0.2: "weight_source", 0.8: "weight_target" };
    const map_nodes = new Map();
    const id_nodes = new Object();
    const nodes = document.createElement("div");
    nodes.style["position"] = "absolute";
    nodes.style["left"] = "0px";
    nodes.style["top"] = "0px";
    nodes.style["width"] = `${nodes_width}px`;
    nodes.style["height"] = `${nodes_height}px`;
    main.appendChild(nodes);
    const links = document.createElement("div");
    main.appendChild(links);
    const labels = document.createElement("div");
    main.appendChild(labels);
    if (edit_mode) {
        const button_download = document.createElement("button");
        button_download.textContent = "Download";
        button_download.style["position"] = "absolute";
        button_download.style["top"] = `${nodes_height + 1}px`;
        button_download.style["left"] = "10px";
        button_download.onpointerdown = dl_graphs;
        main.appendChild(button_download);
    }



    function make_colors(graphs) {
        let hue_delta = Math.floor(360 / graphs.length);
        let k = 0;
        for (let graph of graphs.slice(1)) {
            if (!graph["color"]) {
                graph["color"] = `hsla(${k * hue_delta},100%,50%,0.7)`;
                k += 1;
            }
        }
    }

    function random_position(element, container, x = null, y = null) {
        let rect_container = container.getBoundingClientRect();
        let rect_element = element.getBoundingClientRect();
        let left = Math.floor(0.9 * (x ? x : Math.random()) * rect_container["width"]);
        let top = Math.floor(0.9 * (y ? y : Math.random()) * rect_container["height"]);
        return [left, top];
    }

    function position_loop(el, el_link, el_label = null) {
        let rect = el.getBoundingClientRect();
        el_link.style["width"] = `${rect.right - rect.left}px`;
        el_link.style["height"] = `${rect.bottom - rect.top}px`;
        el_link.style["left"] = `${(rect.left + rect.right) / 2 + window.scrollX}px`;
        el_link.style["top"] = `${(3 * rect.top - rect.bottom) / 2 + window.scrollY}px`;
        if (el_label) {
            let rectlabel = el_label.getBoundingClientRect();
            el_label.style["left"] = `${(3 * rect.right - rect.left) / 2 + window.scrollX - rectlabel["width"] / 2}px`;
            el_label.style["top"] = `${(3 * rect.top - rect.bottom) / 2 + window.scrollY - rectlabel["height"] / 2}px`;
        }
    }

    function position(el1, el2, el_link, label_object) {
        let rect1 = el1.getBoundingClientRect();
        let rect2 = el2.getBoundingClientRect();
        let thickness = el_link.style["height"] ? parseFloat(el_link.style["height"]) : 0;
        let xg = (rect1.left + rect1.right + rect2.left + rect2.right) / 4;
        let yg = (rect1.top + rect1.bottom + rect2.top + rect2.bottom) / 4;
        let dx = (rect2.left + rect2.right - rect1.left - rect1.right);
        let dy = (rect2.top + rect2.bottom - rect1.top - rect1.bottom);
        let detx1 = (rect1.right - rect1.left) * dy - (rect1.bottom - rect1.top) * dx;
        let dety1 = (rect1.right - rect1.left) * dy - (rect1.top - rect1.bottom) * dx;
        let x1 = xg;
        let y1 = yg;
        if (detx1 <= 0 && dety1 >= 0) {
            x1 = rect1.right;
            y1 = (dx == 0) ? yg : (rect1.right - xg) * dy / dx + yg;
        }
        if (detx1 <= 0 && dety1 < 0) {
            x1 = (dy == 0) ? xg : (rect1.top - yg) * dx / dy + xg;
            y1 = rect1.top;
        }
        if (detx1 > 0 && dety1 <= 0) {
            x1 = rect1.left;
            y1 = (dx == 0) ? yg : (rect1.left - xg) * dy / dx + yg;
        }
        if (detx1 > 0 && dety1 > 0) {
            x1 = (dy == 0) ? xg : (rect1.bottom - yg) * dx / dy + xg;
            y1 = rect1.bottom;
        }
        let detx2 = (rect2.right - rect2.left) * dy - (rect2.bottom - rect2.top) * dx;
        let dety2 = (rect2.right - rect2.left) * dy - (rect2.top - rect2.bottom) * dx;
        let x2 = xg;
        let y2 = yg;
        if (detx2 <= 0 && dety2 >= 0) {
            x2 = rect2.left;
            y2 = (dx == 0) ? yg : (rect2.left - xg) * dy / dx + yg;
        }
        if (detx2 <= 0 && dety2 < 0) {
            x2 = (dy == 0) ? xg : (rect2.bottom - yg) * dx / dy + xg;
            y2 = rect2.bottom;
        }
        if (detx2 > 0 && dety2 <= 0) {
            x2 = rect2.right;
            y2 = (dx == 0) ? yg : (rect2.right - xg) * dy / dx + yg;
        }
        if (detx2 > 0 && dety2 > 0) {
            x2 = (dy == 0) ? xg : (rect2.top - yg) * dx / dy + xg;
            y2 = rect2.top;
        }
        let length = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
        let xgr = xg - (length / 2);
        let ygr = yg - (thickness / 2);
        let angle = Math.atan2(y2 - y1, x2 - x1);

        el_link.style["width"] = `${length}px`;
        el_link.style["left"] = `${xgr + window.scrollX}px`;
        el_link.style["top"] = `${ygr + window.scrollY}px`;
        el_link.style["-moz-transform"] = `rotate(${angle}rad)`;
        el_link.style["-webkit-transform"] = `rotate(${angle}rad)`;
        el_link.style["-o-transform"] = `rotate(${angle}rad)`;
        el_link.style["-ms-transform"] = `rotate(${angle}rad)`;
        el_link.style["transform"] = `rotate(${angle}rad)`;

        for (k in label_object) {
            let el_label = label_object[k];
            let rectlabel = el_label.getBoundingClientRect();
            el_label.style["left"] = `${(1 - k) * x1 + k * x2 + window.scrollX - rectlabel["width"] / 2}px`;
            el_label.style["top"] = `${(1 - k) * y1 + k * y2 + window.scrollY - rectlabel["height"] / 2}px`;
        }
    }


    function create_node(text) {
        let node = document.createElement("div");
        node.appendChild(document.createTextNode(text));
        node.style.cssText = `position:absolute; padding:0.3em; z-index:1; border:1px solid ${COLOR}; border-radius:0.3em; background-color: ${BCOLOR}`
        dragElement(node);
        nodes.appendChild(node);
        return node;
    }


    function make_nodes(graphs) {
        for (const graph of graphs) {
            for (const node of graph["nodes"]) {
                let element_node = null;
                if (!id_nodes.hasOwnProperty(node["id"])) {
                    element_node = create_node(node["id"], nodes);
                    map_nodes.set(element_node, { "id": node["id"], "graphs": [graph], "successors": new Map(), "predecessors": new Map(), "loop": false, "x": [], "y": [], "color": [], "color_graph": [] });
                    id_nodes[node["id"]] = element_node;
                }
                else {
                    element_node = id_nodes[node["id"]];
                    map_nodes.get(element_node)["graphs"].push(graph);
                }
                if (element_node) {
                    for (let param of ["x", "y", "color"]) {
                        if (node[param]) { map_nodes.get(element_node)[param].push(node[param]); }
                    }
                    if (graph["color"]) { map_nodes.get(element_node)["color_graph"].push(graph["color"]); }
                }
            }
        }
        let w = 2; // box shadow colors px
        map_nodes.forEach((params, element_node) => {
            let [left, top] = random_position(element_node, nodes, params["x"].slice(-1)[0], params["y"].slice(-1)[0]);
            element_node.style["left"] = `${left}px`;
            element_node.style["top"] = `${top}px`;
            let box_shadow = [];
            params["color_graph"].concat(params["color"]).forEach((color, index) => {
                box_shadow.push(`0 0 0 ${(index + 1) * w}px ${color}`);
            });
            element_node.style["box-shadow"] = box_shadow.join(", ");
        });
    };

    function create_link(directed = true, marker = "►") {
        let link_element = document.createElement("div");
        link_element.style.cssText = `display:flex; margin:0; padding:0; z-index:-1; position:absolute; height:0; justify-content:right; align-items:center; vertical-align: baseline; color:${COLOR}; background-color:${BCOLOR}; border: solid 1px ${COLOR}; font-size:1.5em;`
        if (directed) { link_element.appendChild(document.createTextNode(marker)); }
        links.appendChild(link_element);
        return link_element;
    }

    function create_loop() {
        let loop_element = document.createElement("div");
        loop_element.style.cssText = `display:flex; margin:0; padding:0; z-index:-1; position:absolute; align-items:center; background-color:transparent; border-top: solid 1px ${COLOR};  border-right: solid 1px ${COLOR}; border-radius: 1em;`
        links.appendChild(loop_element);
        return loop_element;
    }

    function create_label() {
        let label = document.createElement("div");
        label.style.cssText = `position:absolute; user-select:none; color:${COLOR}; font-size:smaller; border-radius:0.4em; background-color:${BCOLOR};`;
        labels.appendChild(label);
        return label;
    }

    function make_links(graphs) {
        let map_links = new Map();
        for (const graph of graphs) {
            for (const link of graph["links"]) {
                let source_element = id_nodes[link["source"]];
                let target_element = id_nodes[link["target"]];
                let link_element = null;
                let label_object = null;
                let loop = (source_element == target_element);
                if (loop) {
                    if (map_nodes.get(source_element)["loop"]) {
                        link_element = map_nodes.get(source_element)["loop"]["link"];
                        label_element = map_nodes.get(source_element)["loop"]["label"];
                    } else {
                        link_element = create_loop();
                        label_element = create_label();
                        map_nodes.get(source_element)["loop"] = {
                            "link": link_element,
                            "label": label_element,
                        };
                        map_links.set(link_element, { "colors": [], "colors_graphs": [] });
                    };
                    for (k in LABELS) {
                        if (link[LABELS[k]]) {
                            let content = document.createElement("div");
                            content.appendChild(document.createTextNode(link[LABELS[k]]));
                            content.style["color"] = graph["color"] ? graph["color"] : COLOR;
                            ;
                            label_element.appendChild(content);
                        }
                    }
                    position_loop(source_element, link_element, label_element);
                }
                else {
                    if (map_nodes.get(source_element)["successors"].has(target_element)) {
                        link_element = map_nodes.get(source_element)["successors"].get(target_element)["link"];
                        label_object = map_nodes.get(source_element)["successors"].get(target_element)["labels"];
                    } else {
                        link_element = create_link(graph["directed"]);
                        label_object = {};
                        for (let k in LABELS) {
                            label_object[k] = create_label();
                        };
                        map_nodes.get(source_element)["successors"].set(target_element, {
                            "link": link_element, "labels": label_object,
                        });
                        map_nodes.get(target_element)["predecessors"].set(source_element, {
                            "link": link_element, "labels": label_object,
                        });
                        map_links.set(link_element, { "colors": [], "colors_graphs": [] });
                        position(source_element, target_element, link_element, label_object);
                    }
                    for (k in LABELS) {
                        if (link[LABELS[k]]) {
                            let content = document.createElement("div");
                            content.appendChild(document.createTextNode(link[LABELS[k]]));
                            content.style["color"] = graph["color"] ? graph["color"] : COLOR;
                            label_object[k].appendChild(content);
                        }
                    }

                }
                if (graph["color"]) {
                    map_links.get(link_element)["colors_graphs"].push(graph["color"]);
                }
                if (link["color"]) {
                    map_links.get(link_element)["colors"].push(link["color"]);
                }
            }
        }
        let w = 1.5; // box shadow colors px
        map_links.forEach((params, link_element) => {
            let box_shadow = [];
            params["colors_graphs"].concat(params["colors"]).forEach((color, index) => {
                box_shadow.push(`0 0 0 ${(index + 1) * w}px ${color}`);
            });
            link_element.style["box-shadow"] = box_shadow.join(", ");
        });
    }



    function dragElement(elmnt) {
        elmnt.onpointerdown = function(e) {
            e = e || window.event;
            e.preventDefault();
            let rect = elmnt.getBoundingClientRect();
            let dx = e.pageX - rect.left;
            let xd = e.pageX - rect.right;
            let dy = e.pageY - rect.top;
            let yd = e.pageY - rect.bottom;
            document.onpointerup = () => {
                document.onpointerup = null;
                document.onpointermove = null;
            }

            document.onpointermove = function(e) {
                let bounds = nodes.getBoundingClientRect();
                if ((e.pageX - xd < bounds["right"]) && (e.pageX - dx > bounds["left"])) {
                    let left = e.pageX - bounds["left"] - dx;
                    elmnt.style.left = `${left}px`;
                }
                if ((e.pageY - yd < bounds["bottom"]) && (e.pageY - dy > bounds["top"])) {
                    let top = e.pageY - bounds["top"] - dy;
                    elmnt.style.top = `${top}px`;
                }
                for (let [key, data] of map_nodes.get(elmnt)["successors"]) {
                    position(elmnt, key, data["link"], data["labels"]);
                }
                for (let [key, data] of map_nodes.get(elmnt)["predecessors"]) {
                    position(key, elmnt, data["link"], data["labels"]);
                }
                if (map_nodes.get(elmnt)["loop"]) {
                    position_loop(elmnt, map_nodes.get(elmnt)["loop"]["link"], map_nodes.get(elmnt)["loop"]["label"]);
                }
            }
        }
    }


    function dl_graphs() {
        for (let graph of graphs) {
            for (let node of graph["nodes"]) {
                node["x"] = parseFloat(id_nodes[node["id"]].style["left"].replace("px", "")) / nodes_width;
                node["y"] = parseFloat(id_nodes[node["id"]].style["top"].replace("px", "")) / nodes_height;
            }
        }
        let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(graphs, null, 2));
        let download_element = document.createElement('a');
        download_element.setAttribute("href", dataStr);
        download_element.setAttribute("download", FILENAME + ".json");
        document.body.appendChild(download_element); // required for firefox
        download_element.click();
        download_element.remove();
    }


    make_colors(graphs);
    make_nodes(graphs);
    make_links(graphs);
}

