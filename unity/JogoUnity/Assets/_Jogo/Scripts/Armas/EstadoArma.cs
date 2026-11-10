using Jogo.Nucleo;
using UnityEngine;

namespace Jogo.Armas
{
    /// <summary>Munição, cadência e recarga de uma arma (lógica pura, roda no servidor).</summary>
    public class EstadoArma
    {
        public readonly DadosArma dados;
        public int Pente { get; private set; }
        public int Reserva { get; private set; }
        public float Espera { get; private set; }        // até poder atirar de novo
        public float RecargaRestante { get; private set; }
        public bool Recarregando => RecargaRestante > 0f;

        public EstadoArma(DadosArma dados)
        {
            this.dados = dados;
            Pente = dados.pente;
            Reserva = dados.reserva;
        }

        public void Tick(float dt)
        {
            if (Espera > 0f) Espera = Mathf.Max(0f, Espera - dt);
            if (RecargaRestante > 0f)
            {
                RecargaRestante -= dt;
                if (RecargaRestante <= 0f)
                {
                    int t = Mathf.Min(dados.pente - Pente, Reserva);
                    Pente += t; Reserva -= t; RecargaRestante = 0f;
                }
            }
        }

        public bool PodeAtirar => !Recarregando && Espera <= 0f && (dados.tipo == TipoArma.Corpo || Pente > 0);

        /// <summary>Gasta um tiro. Devolve false se não pôde (sem bala inicia recarga).</summary>
        public bool Disparar()
        {
            if (Recarregando || Espera > 0f) return false;
            if (dados.tipo == TipoArma.Fogo)
            {
                if (Pente <= 0) { IniciarRecarga(); return false; }
                Pente--;
            }
            Espera = dados.cadencia;
            if (dados.tipo == TipoArma.Fogo && Pente == 0) IniciarRecarga();
            return true;
        }

        public bool IniciarRecarga()
        {
            if (dados.tipo != TipoArma.Fogo || Recarregando || Pente >= dados.pente || Reserva <= 0) return false;
            RecargaRestante = dados.recarga;
            return true;
        }

        /// <summary>Trocar de arma cancela a recarga (como no protótipo).</summary>
        public void CancelarRecarga() => RecargaRestante = 0f;

        public void Reabastecer() { Pente = dados.pente; Reserva = dados.reserva; Espera = 0f; RecargaRestante = 0f; }
    }
}
