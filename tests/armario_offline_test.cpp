#include <cassert>
#include <cstdint>
#include "../armario_offline/controle_armario.h"

using A = AmostraArmario;
using R = AcaoArmario;

int main() {
  const char* a = "01:02:03:04";
  const char* b = "05:06:07:08";
  ControleArmario c;
  assert(c.observar(A::Presente, a, false, 0) == R::Nenhuma);
  for (uint32_t t = 100; t < 10000; t += 100)
    assert(c.observar(A::Presente, a, false, t) == R::Nenhuma);
  assert(c.observar(A::Presente, a, false, 10000) == R::Cadastrar);
  assert(c.observar(A::Presente, a, true, 10100) == R::Nenhuma);
  for (uint32_t t = 10200; t < 10900; t += 100)
    assert(c.observar(A::Ausente, nullptr, false, t) == R::Nenhuma);
  assert(c.observar(A::Ausente, nullptr, false, 10900) == R::Nenhuma);
  assert(c.observar(A::Presente, a, true, 11000) == R::Alternar);
  assert(c.observar(A::Presente, b, true, 11100) == R::Nenhuma);

  // Falhas e leituras presentes interrompem a prova de retirada.
  for (uint32_t t = 11200; t <= 11600; t += 100) c.observar(A::Ausente, nullptr, false, t);
  c.observar(A::Erro, nullptr, false, 11700);
  for (uint32_t t = 11800; t <= 12400; t += 100) c.observar(A::Ausente, nullptr, false, t);
  assert(c.observar(A::Presente, b, true, 12500) == R::Nenhuma);
  for (uint32_t t = 12600; t <= 13300; t += 100) c.observar(A::Ausente, nullptr, false, t);
  assert(c.observar(A::Presente, b, true, 13400) == R::Alternar);

  ControleArmario interrompido;
  assert(interrompido.observar(A::Presente, a, false, 0) == R::Nenhuma);
  for (uint32_t t = 100; t <= 5000; t += 100) interrompido.observar(A::Presente, a, false, t);
  interrompido.observar(A::Erro, nullptr, false, 5100);
  for (uint32_t t = 5200; t < 15200; t += 100)
    assert(interrompido.observar(A::Presente, a, false, t) == R::Nenhuma);
  assert(interrompido.observar(A::Presente, a, false, 15200) == R::Cadastrar);

  ControleArmario mudanca;
  for (uint32_t t = 0; t <= 5000; t += 100) mudanca.observar(A::Presente, a, false, t);
  for (uint32_t t = 5100; t < 15100; t += 100)
    assert(mudanca.observar(A::Presente, b, false, t) == R::Nenhuma);
  assert(mudanca.observar(A::Presente, b, false, 15100) == R::Cadastrar);

  ControleArmario lacuna;
  for (uint32_t t = 0; t <= 5000; t += 100) lacuna.observar(A::Presente, a, false, t);
  for (uint32_t t = 5300; t < 15300; t += 100)
    assert(lacuna.observar(A::Presente, a, false, t) == R::Nenhuma);
  assert(lacuna.observar(A::Presente, a, false, 15300) == R::Cadastrar);

  ControleArmario transbordo;
  uint32_t inicio = UINT32_MAX - 5000U;
  for (uint32_t t = 0; t < 10000; t += 100)
    assert(transbordo.observar(A::Presente, a, false, inicio + t) == R::Nenhuma);
  assert(transbordo.observar(A::Presente, a, false, inicio + 10000U) == R::Cadastrar);
}
