#include <cassert>
#include "../esp32/include/restauracao_posicao.h"

int main() {
 using P = PosicaoAoReiniciar;
 assert(posicaoAoReiniciar(0,true,false,"disponivel") == P::Fechada);
 assert(posicaoAoReiniciar(0,true,false,"manutencao") == P::Fechada);
 assert(posicaoAoReiniciar(0,true,false,"em_uso") == P::Aberta);
 assert(posicaoAoReiniciar(0,true,false,"erro") == P::NaoMover);
 assert(posicaoAoReiniciar(0,true,false,"desconhecido") == P::NaoMover);
 assert(posicaoAoReiniciar(0,true,false,nullptr) == P::NaoMover);
 assert(posicaoAoReiniciar(0,false,false,"disponivel") == P::NaoMover);
 assert(posicaoAoReiniciar(0,true,true,"em_uso") == P::NaoMover);
 assert(posicaoAoReiniciar(1,true,false,"em_uso") == P::NaoMover);
 assert(posicaoAoReiniciar(2,true,false,"disponivel") == P::NaoMover);
}
