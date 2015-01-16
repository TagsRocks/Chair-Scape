var TerrainSlice = (function()
{
	this.loaded = false;
	this.id = -1;
	this.Mesh;
	this.position;
	this.material;
	
	this.mapTriggers;
	
	function TerrainSlice(id,pos)
	{
		console.log("Creating Land Object ["+id+",("+pos.x+","+pos.y+","+pos.z+")]");
		this.id = id;
		this.createLandTriggers(pos);
	}
	
	return TerrainSlice;
})();

TerrainSlice.prototype.createLandTriggers = function(pos)
{
	this.mapTriggers = new Array();
	
	console.log("Creating Land["+this.id+"] Trigger at...");
	console.log(pos);
	
	this.mapTriggers[0] = new Trigger
	(
		new THREE.Vector3(100,2000,10000),
		new THREE.Vector3(pos.x - 4950, pos.y + 100, pos.z),
		new THREE.Color("rgb(255,0,0)"),
		(function() { loadLand(this.id - 1, this.position - new THREE.Vector3(10000,0,0)); })
	);
	
	this.mapTriggers[1] = new Trigger
	(
		new THREE.Vector3(10000,2000,100),
		new THREE.Vector3(pos.x, pos.y + 100, pos.z - 4950),
		new THREE.Color("rgb(0,255,0)"),
		(function() { console.log("func trig test"); })
	);
	
	this.mapTriggers[2] = new Trigger
	(
		new THREE.Vector3(100,2000,10000),
		new THREE.Vector3(pos.x + 4950, pos.y + 100, pos.z),
		new THREE.Color("rgb(0,0,255)"),
		(function() { console.log("func trig test"); })
	);
	
	this.mapTriggers[3] = new Trigger
	(
		new THREE.Vector3(10000,2000,100),
		new THREE.Vector3(pos.x, pos.y + 100, pos.z + 4950),
		new THREE.Color("rgb(255,255,0)"),
		(function() { console.log("func trig test"); })
	);
};

TerrainSlice.prototype.Update = function()
{
	this.mapTriggers.forEach(function(v,i,a)
	{
		v.Update();
	});
};





function loadLand(landx,pos)
{
	if(TerrainSlices[landx]) { return; }
	//CLog('loading: '+landmodels+landx+ext);
	TerrainSlices[landx] = new TerrainSlice(landx,pos);
	TerrainSlices[landx].loaded = 'loading';
	var id = landx;
	
	TerrainSlices[id].position = new THREE.Vector3();
	TerrainSlices[id].position.x += pos.x;
	TerrainSlices[id].position.y += pos.y;
	TerrainSlices[id].position.z += pos.z;
	
	console.log(TerrainSlices[id].position);
	var loader = new THREE.JSONLoader();
	
	loadScript(landmodels+landx+"/landscript"+landx+ext,
		function() 
		{ 
			console.log('Loaded sript[\'landscript'+landx+'.js\']'); 
		} 
	);
	
	loader.load(landmodels+landx+"/land"+landx+ext, function(geometry, materials) 
	{	
		console.log(materials);
		console.log(landx+" textures: "+materials[0].map.sourceFile+", "+materials[1].map.sourceFile);

		TerrainSlices[id].material = new THREE.ShaderMaterial(
		{
			uniforms: THREE.UniformsUtils.merge(
			[
				THREE.UniformsLib['lights'],
				THREE.UniformsLib[ "common" ],
				THREE.UniformsLib[ "fog" ],
				THREE.UniformsLib[ "lights" ],
				THREE.UniformsLib[ "shadowmap" ],
			{
				t0: { type: "t", value: null},
				t1: { type: "t", value: null},
				blendMap: { type: "t", value: null},
				repeat: { type:'f', value: 35 },
				topColor:    { type: "c", value: new THREE.Color( 0x0077ff ) },
				bottomColor: { type: "c", value: new THREE.Color( 0xffffff ) },
				offset:      { type: "f", value: 33 },
				exponent:    { type: "f", value: 0.6 },
				fogColor:    { type: "c", value: scene.fog.color },
				fogNear:     { type: "f", value: scene.fog.near },
				fogFar:      { type: "f", value: scene.fog.far }
			}
			]), 
			lights: true,
			fog: true,
			vertexShader: 
			[

				"#define LAMBERT",

				"varying vec3 vLightFront;",

				"varying vec2 vUv;",

				"#ifdef DOUBLE_SIDED",

				"varying vec3 vLightBack;",

				"#endif",

				THREE.ShaderChunk[ "map_pars_vertex" ],
				THREE.ShaderChunk[ "lightmap_pars_vertex" ],
				THREE.ShaderChunk[ "envmap_pars_vertex" ],
				THREE.ShaderChunk[ "lights_lambert_pars_vertex" ],
				THREE.ShaderChunk[ "color_pars_vertex" ],
				THREE.ShaderChunk[ "morphtarget_pars_vertex" ],
				THREE.ShaderChunk[ "skinning_pars_vertex" ],
				THREE.ShaderChunk[ "shadowmap_pars_vertex" ],

				"void main() {",
					"vUv = uv;",

					THREE.ShaderChunk[ "map_vertex" ],
					THREE.ShaderChunk[ "lightmap_vertex" ],
					THREE.ShaderChunk[ "color_vertex" ],

					THREE.ShaderChunk[ "morphnormal_vertex" ],
					THREE.ShaderChunk[ "skinbase_vertex" ],
					THREE.ShaderChunk[ "skinnormal_vertex" ],
					THREE.ShaderChunk[ "defaultnormal_vertex" ],

					THREE.ShaderChunk[ "morphtarget_vertex" ],
					THREE.ShaderChunk[ "skinning_vertex" ],
					THREE.ShaderChunk[ "default_vertex" ],

					THREE.ShaderChunk[ "worldpos_vertex" ],
					THREE.ShaderChunk[ "envmap_vertex" ],
					THREE.ShaderChunk[ "lights_lambert_vertex" ],
					THREE.ShaderChunk[ "shadowmap_vertex" ],
				"}"

			].join("\n"),
			fragmentShader: 
			[

				"uniform float opacity;",

				"varying vec3 vLightFront;",

				"#ifdef DOUBLE_SIDED",

					"varying vec3 vLightBack;",

				"#endif",

				"uniform sampler2D t0;",
				"uniform sampler2D t1;",
				"uniform sampler2D blendMap;",
				"uniform float repeat;",
				"varying vec2 vUv;",

				THREE.ShaderChunk[ "color_pars_fragment" ],
				THREE.ShaderChunk[ "map_pars_fragment" ],
				THREE.ShaderChunk[ "lightmap_pars_fragment" ],
				THREE.ShaderChunk[ "envmap_pars_fragment" ],
				THREE.ShaderChunk[ "fog_pars_fragment" ],
				THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
				THREE.ShaderChunk[ "specularmap_pars_fragment" ],



				"void main() {",
					"gl_FragColor = vec4( vec3 ( 1.0 ), opacity );",

					"vec3 c;",
					"vec4 Ca = texture2D(t0, vUv * repeat);",
					"vec4 Cb = texture2D(t1, vUv * repeat);",
					"vec4 b = texture2D(blendMap, vUv);",
					THREE.ShaderChunk[ "map_fragment" ],
					THREE.ShaderChunk[ "alphatest_fragment" ],
					THREE.ShaderChunk[ "specularmap_fragment" ],

					"#ifdef DOUBLE_SIDED",

						"float isFront = float( gl_FrontFacing );",
						"gl_FragColor.xyz *= isFront * vLightFront + ( 1.0 - isFront ) * vLightBack;",

						"if ( gl_FrontFacing )",
							"gl_FragColor.xyz *= vLightFront;",
						"else",
							"gl_FragColor.xyz *= vLightBack;",

					"#else",

						"gl_FragColor.xyz *= vLightFront;",

					"#endif",


					THREE.ShaderChunk[ "lightmap_fragment" ],
					THREE.ShaderChunk[ "color_fragment" ],
					THREE.ShaderChunk[ "envmap_fragment" ],
					THREE.ShaderChunk[ "shadowmap_fragment" ],

					"gl_FragColor *= vec4(mix(Ca.rgb, Cb.rgb, b.r),0);",
					THREE.ShaderChunk[ "linear_to_gamma_fragment" ],

					THREE.ShaderChunk[ "fog_fragment" ],

				"}"

			].join("\n")


		});
		console.log(TerrainSlices[id].material.uniforms);
		TerrainSlices[id].material.uniforms.t0.value = materials[0].map;
		TerrainSlices[id].material.uniforms.t1.value = materials[1].map;
		TerrainSlices[id].material.uniforms.blendMap.value = 
		ImageLoad("land/land"+landx+"_blendmap.png" );

		TerrainSlices[id].material.uniforms.t0.value.wrapS = TerrainSlices[id].material.uniforms.t0.value.wrapT = THREE.RepeatWrapping;
		TerrainSlices[id].material.uniforms.t1.value.wrapS = TerrainSlices[id].material.uniforms.t1.value.wrapT = THREE.RepeatWrapping;


		TerrainSlices[id].Mesh = new THREE.Mesh(geometry, TerrainSlices[id].material);
		
		TerrainSlices[id].Mesh.position = new THREE.Vector3(pos.x, pos.y, pos.z);
		TerrainSlices[id].Mesh.position = new THREE.Vector3();
		TerrainSlices[id].Mesh.position.x += TerrainSlices[id].position.x;
		TerrainSlices[id].Mesh.position.y += TerrainSlices[id].position.y;
		TerrainSlices[id].Mesh.position.z += TerrainSlices[id].position.z;
		
		TerrainSlices[id].Mesh.scale.set(100,100,100);
		TerrainSlices[id].Mesh.receiveShadow = true;
		TerrainSlices[id].Mesh.castShadow = true;
		Land.push(TerrainSlices[id].Mesh);

		//console.log('Adding land mesh['+id+']');
		scene.add(TerrainSlices[id].Mesh);
		TerrainSlices[id].loaded = true;
	});	
}