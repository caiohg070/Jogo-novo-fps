using System.Collections.Generic;
using Jogo.Nucleo;
using UnityEngine;

namespace Jogo.Armas
{
    /// <summary>Quem pode levar tiro (soldado, alvo...).</summary>
    public interface IAlvoTiro
    {
        int Equipe { get; }
        bool Vivo { get; }
        Vector3 PosicaoPe { get; }
    }

    public struct ResultadoTiro
    {
        public Vector3 inicio, fim;
        public IAlvoTiro alvo;     // null = bateu no cenário ou no nada
        public bool bateuCenario;
    }

    /// <summary>Tiro hitscan: linha reta na altura do tiro, para no primeiro inimigo ou parede.</summary>
    public static class ResolvedorTiro
    {
        public static ResultadoTiro Resolver(Vector3 origem, Vector2 direcao, float alcance, float raioAcerto,
            IAlvoTiro atirador, IReadOnlyList<IAlvoTiro> alvos, int mascaraCenario)
        {
            var r = new ResultadoTiro { inicio = origem };
            Vector3 dir3 = new Vector3(direcao.x, 0f, direcao.y);
            float melhor = alcance;

            if (Physics.Raycast(origem, dir3, out RaycastHit h, alcance, mascaraCenario, QueryTriggerInteraction.Ignore))
            {
                melhor = h.distance; r.bateuCenario = true;
            }

            Vector2 o2 = new Vector2(origem.x, origem.z);
            for (int i = 0; i < alvos.Count; i++)
            {
                var a = alvos[i];
                if (a == atirador || !a.Vivo || a.Equipe == atirador.Equipe) continue;
                Vector3 p = a.PosicaoPe;
                float d = RegrasCombate.RaioContraCirculo(o2, direcao, new Vector2(p.x, p.z), raioAcerto, melhor);
                if (d >= 0f && d <= melhor) { melhor = d; r.alvo = a; r.bateuCenario = false; }
            }
            r.fim = origem + dir3 * melhor;
            return r;
        }
    }
}
