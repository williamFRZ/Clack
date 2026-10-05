#include <cassert>
#include "../esp32/include/comando.h"
int main() {
  assert(interpretarComando(200, "abrir") == Comando::Abrir);
  assert(interpretarComando(200, "fechar") == Comando::Fechar);
  assert(interpretarComando(500, "abrir") == Comando::Ignorar);
  assert(interpretarComando(404, "fechar") == Comando::Ignorar);
  assert(interpretarComando(-1, "") == Comando::Ignorar);
  assert(interpretarComando(200, "erro") == Comando::Ignorar);
  assert(interpretarComando(200, "<html>abrir</html>") == Comando::Ignorar);
  assert(interpretarComando(200, "{\"status\":\"erro\"}") == Comando::Ignorar);
  assert(interpretarComando(200, nullptr) == Comando::Ignorar);
}
