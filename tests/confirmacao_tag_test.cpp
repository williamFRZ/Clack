#include <cassert>
#include <cstdint>
#include "../esp32/include/confirmacao_tag.h"

using R = ResultadoConfirmacaoTag;

int main() {
  const char* a = "01:02:03:04";
  const char* b = "05:06:07:08";
  ConfirmacaoTag c;
  assert(!c.iniciar(nullptr, 0));
  assert(!c.iniciar("", 0));
  assert(!c.iniciar("01:02:03:04:05:06:07:08:09:0A:0B", 0));
  assert(c.iniciar(a, 0));
  for (uint32_t t = 200; t < 3000; t += 200)
    assert(c.observar(a, t) == R::Aguardando);
  assert(c.observar(a, 2999) == R::Aguardando);
  assert(c.observar(a, 3000) == R::Confirmada);
  assert(c.confirmada());
  assert(c.observar(a, 3200) == R::Inativa);
  assert(!c.iniciar(a, 3200));
  c.liberarAposRetirada();
  assert(c.iniciar(a, 3300));
  assert(c.observar(b, 3400) == R::Cancelada);
  assert(!c.ativa());

  assert(c.iniciar(a, 4000));
  assert(c.observar(nullptr, 4250) == R::Aguardando);
  assert(c.observar(a, 4250) == R::Aguardando);
  assert(c.observar("", 4501) == R::Cancelada);
  assert(c.iniciar(a, 5000));
  assert(c.observar(a, 5251) == R::Cancelada);

  assert(c.iniciar(a, 6000));
  assert(c.cancelar() == R::Cancelada);
  assert(c.observar(a, 9000) == R::Inativa);

  // O contador millis() de 32 bits pode transbordar durante a apresentação.
  const uint32_t inicio = UINT32_MAX - 1000U;
  assert(c.iniciar(a, inicio));
  for (uint32_t passo = 200; passo < 3000; passo += 200)
    assert(c.observar(a, inicio + passo) == R::Aguardando);
  assert(c.observar(a, inicio + 3000U) == R::Confirmada);

  using A = AmostraRetiradaTag;
  ConfirmacaoRetiradaTag retirada;
  for (uint32_t t = 0; t < 700; t += 100)
    assert(!retirada.observar(A::Timeout, t));
  assert(retirada.emAndamento()); // O chamador deve evitar HTTP bloqueante.
  assert(retirada.observar(A::Timeout, 700));
  assert(!retirada.emAndamento());
  assert(!retirada.observar(A::Timeout, 800)); // Uma única confirmação.
  assert(!retirada.observar(A::Presente, 900));

  // Um intervalo de 250 ms é aceito, mas uma lacuna maior reinicia a prova.
  assert(!retirada.observar(A::Timeout, 1000));
  assert(!retirada.observar(A::Timeout, 1250));
  assert(!retirada.observar(A::Timeout, 1501));
  assert(!retirada.observar(A::Timeout, 1751));
  assert(!retirada.observar(A::Timeout, 2001));
  assert(retirada.observar(A::Timeout, 2201));

  // Se o leitor produzir lacunas repetidas, a prova expira sem liberar a
  // tag; a rede volta a ter oportunidade de sincronizar antes de nova prova.
  retirada.reiniciar();
  for (uint32_t t = 5000; t < 6500; t += 300) {
    assert(!retirada.observar(A::Timeout, t));
    assert(retirada.emAndamento());
  }
  assert(!retirada.observar(A::Timeout, 6500));
  assert(!retirada.emAndamento());
  assert(!retirada.observar(A::Timeout, 6600));
  assert(retirada.emAndamento());

  // Qualquer amostra não conclusiva interrompe a sequência, inclusive colisão.
  const A interrupcoes[] = {A::Presente, A::Colisao, A::Erro, A::UidIlegivel};
  for (A interrupcao : interrupcoes) {
    retirada.reiniciar();
    assert(!retirada.observar(A::Timeout, 3000));
    assert(!retirada.observar(A::Timeout, 3200));
    assert(!retirada.observar(A::Timeout, 3400));
    assert(!retirada.observar(interrupcao, 3450));
    assert(!retirada.observar(A::Timeout, 3500));
    assert(!retirada.observar(A::Timeout, 3700));
    assert(!retirada.observar(A::Timeout, 3900));
    assert(!retirada.observar(A::Timeout, 4100));
    assert(retirada.observar(A::Timeout, 4200));
  }

  retirada.reiniciar();
  const uint32_t inicioRetirada = UINT32_MAX - 300U;
  for (uint32_t passo = 0; passo < 700; passo += 100)
    assert(!retirada.observar(A::Timeout, inicioRetirada + passo));
  assert(retirada.observar(A::Timeout, inicioRetirada + 700U));
}
