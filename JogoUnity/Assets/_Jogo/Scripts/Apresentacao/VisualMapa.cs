using System.Collections.Generic;
using Jogo.Mapa;
using UnityEngine;

namespace Jogo.Apresentacao
{
    /// <summary>
    /// Mostra só os blocos perto do jogador (os outros são desligados). Greybox: terreno + caixas.
    /// O visual final troca só esta classe (kits de peças do Blender); a geração e as regras continuam iguais.
    /// </summary>
    public class VisualMapa : MonoBehaviour
    {
        public int raioBlocos = 1;           // 1 = 3×3 blocos ativos
        public int resolucaoTerreno = 25;    // vértices por lado em cada bloco (2 m)
        public Material materialTerreno, materialPredio;

        GeradorMapa gerador;
        readonly Dictionary<(int, int), GameObject> ativos = new Dictionary<(int, int), GameObject>();
        (int, int) ultimoCentro = (int.MinValue, 0);

        public void Iniciar(GeradorMapa g) { gerador = g; }

        public void Atualizar(Vector3 posJogador)
        {
            if (gerador == null) return;
            var centro = GeradorMapa.BlocoEm(posJogador.x, posJogador.z);
            if (centro == ultimoCentro) return;
            ultimoCentro = centro;

            var querer = new HashSet<(int, int)>();
            for (int dx = -raioBlocos; dx <= raioBlocos; dx++)
            for (int dz = -raioBlocos; dz <= raioBlocos; dz++)
            {
                int cx = centro.cx + dx, cz = centro.cz + dz;
                if (GeradorMapa.DentroDoMapa(cx, cz)) querer.Add((cx, cz));
            }
            foreach (var k in querer)
            {
                if (!ativos.TryGetValue(k, out var go)) ativos[k] = go = CriarBloco(k.Item1, k.Item2);
                go.SetActive(true);
            }
            foreach (var kv in ativos) if (!querer.Contains(kv.Key)) kv.Value.SetActive(false);
        }

        GameObject CriarBloco(int cx, int cz)
        {
            var bloco = gerador.Bloco(cx, cz);
            var raiz = new GameObject($"Bloco_{cx}_{cz}");
            raiz.transform.SetParent(transform, false);

            // Terreno
            int n = resolucaoTerreno;
            float passo = Regras.TamanhoBloco / (n - 1);
            var o = bloco.Origem;
            var verts = new Vector3[n * n];
            var uvs = new Vector2[n * n];
            for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
            {
                float x = o.x + j * passo, z = o.z + i * passo;
                verts[i * n + j] = new Vector3(x, gerador.Altura(x, z), z);
                uvs[i * n + j] = new Vector2(x, z) * 0.1f;
            }
            var tris = new int[(n - 1) * (n - 1) * 6];
            int t = 0;
            for (int i = 0; i < n - 1; i++)
            for (int j = 0; j < n - 1; j++)
            {
                int a = i * n + j;
                tris[t++] = a; tris[t++] = a + n; tris[t++] = a + 1;
                tris[t++] = a + 1; tris[t++] = a + n; tris[t++] = a + n + 1;
            }
            var mesh = new Mesh { name = raiz.name, vertices = verts, uv = uvs, triangles = tris };
            mesh.RecalculateNormals();
            mesh.RecalculateBounds();
            var terreno = new GameObject("Terreno");
            terreno.transform.SetParent(raiz.transform, false);
            terreno.AddComponent<MeshFilter>().sharedMesh = mesh;
            terreno.AddComponent<MeshRenderer>().sharedMaterial = materialTerreno;

            // Construções (greybox)
            foreach (var c in bloco.construcoes)
            {
                float alt = c.andares * Regras.AlturaAndar;
                var caixa = GameObject.CreatePrimitive(PrimitiveType.Cube);
                caixa.name = $"{c.tipo}_{c.andares}a";
                caixa.transform.SetParent(raiz.transform, false);
                caixa.transform.position = c.centro.ParaUnity(c.alturaBase + alt / 2);
                caixa.transform.rotation = Quaternion.Euler(0, c.rotacao90 * 90, 0);
                caixa.transform.localScale = new Vector3(c.largura, alt, c.profundidade);
                Destroy(caixa.GetComponent<Collider>());   // colisão é da simulação, não da física da Unity
                if (materialPredio) caixa.GetComponent<MeshRenderer>().sharedMaterial = materialPredio;
            }
            return raiz;
        }
    }
}
