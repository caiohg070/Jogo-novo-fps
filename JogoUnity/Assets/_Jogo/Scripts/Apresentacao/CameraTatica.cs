using UnityEngine;

namespace Jogo.Apresentacao
{
    /// <summary>Câmera fixa a 75°, segue o jogador sem girar (igual ao protótipo).</summary>
    public class CameraTatica : MonoBehaviour
    {
        public Transform alvo;
        public float distancia = 22f;
        public float campoDeVisao = 40f;
        public float suavidade = 12f;

        void Start()
        {
            var cam = GetComponent<Camera>();
            if (cam) cam.fieldOfView = campoDeVisao;
            transform.rotation = Quaternion.Euler(Regras.AnguloCamera, 0, 0);
        }

        void LateUpdate()
        {
            if (!alvo) return;
            var desejada = alvo.position - transform.rotation * Vector3.forward * distancia;
            transform.position = Vector3.Lerp(transform.position, desejada, 1 - Mathf.Exp(-suavidade * Time.deltaTime));
        }
    }
}
