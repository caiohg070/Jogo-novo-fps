using UnityEngine;

namespace Jogo.Nucleo
{
    /// <summary>
    /// Visão justa ("fairView" do protótipo): câmera base igual para todos (sem zoom nem luneta).
    /// A só vê B se B também veria A. Bots usam a mesma regra. No online o servidor usa isto para
    /// não mandar a posição de quem não deve ser visto (anti "wallhack").
    /// </summary>
    public static class VisaoJusta
    {
        /// <summary>Um ponto, deslocado do observador por "delta", cabe na tela da câmera base?</summary>
        public static bool NaTelaBase(Vector3 delta, DadosCamera cam, float aspecto)
        {
            float escala = cam.EscalaPorAspecto(aspecto);
            Vector3 posCam = cam.deslocamento * escala + Vector3.up * cam.alturaAlvo;
            Vector3 ponto = delta + Vector3.up * cam.alturaPontoVisao;
            Vector3 v = Quaternion.Inverse(cam.Rotacao) * (ponto - posCam);
            if (v.z <= cam.perto) return false;
            float t = Mathf.Tan(cam.fovVertical * 0.5f * Mathf.Deg2Rad);
            float x = v.x / (v.z * t * aspecto), y = v.y / (v.z * t);
            return Mathf.Abs(x) <= 1f && Mathf.Abs(y) <= 1f;
        }

        /// <summary>Quem está em "de" pode ver quem está em "para" (posições do pé)?</summary>
        public static bool PodeVer(Vector3 de, Vector3 para, DadosCamera cam, float aspecto)
        {
            Vector3 d = para - de;
            return NaTelaBase(d, cam, aspecto) && NaTelaBase(-d, cam, aspecto);
        }
    }
}
